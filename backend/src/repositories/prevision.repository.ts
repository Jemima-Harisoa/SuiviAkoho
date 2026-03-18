import sql from 'mssql';
import { getPool } from '../config/database.config';
import { CreatePrevisionDto, Prevision, UpdatePrevisionDto } from '../models/prevision.model';

export async function findAll(): Promise<Prevision[]> {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT
      PrevisionId AS previsionId,
      LotId AS lotId,
      Category AS category,
      Description AS description,
      PlannedDate AS plannedDate,
      PlannedAmountAr AS plannedAmountAr,
      Status AS status,
      RealizedDate AS realizedDate,
      RealizedAmountAr AS realizedAmountAr,
      VarianceAr AS varianceAr,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM dbo.Prevision
      ORDER BY PlannedDate DESC, CreatedAt DESC`);
  return result.recordset;
}

export async function findById(previsionId: number): Promise<Prevision | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.BigInt, previsionId)
    .query(`SELECT
      PrevisionId AS previsionId,
      LotId AS lotId,
      Category AS category,
      Description AS description,
      PlannedDate AS plannedDate,
      PlannedAmountAr AS plannedAmountAr,
      Status AS status,
      RealizedDate AS realizedDate,
      RealizedAmountAr AS realizedAmountAr,
      VarianceAr AS varianceAr,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM dbo.Prevision
      WHERE PrevisionId = @id`);

  return result.recordset[0] ?? null;
}

export async function findByDateRange(startDate: Date, endDate: Date): Promise<Prevision[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('startDate', sql.Date, startDate)
    .input('endDate', sql.Date, endDate)
    .query(`SELECT
      PrevisionId AS previsionId,
      LotId AS lotId,
      Category AS category,
      Description AS description,
      PlannedDate AS plannedDate,
      PlannedAmountAr AS plannedAmountAr,
      Status AS status,
      RealizedDate AS realizedDate,
      RealizedAmountAr AS realizedAmountAr,
      VarianceAr AS varianceAr,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM dbo.Prevision
      WHERE PlannedDate BETWEEN @startDate AND @endDate
      ORDER BY PlannedDate DESC, CreatedAt DESC`);

  return result.recordset;
}

export async function findPending(): Promise<Prevision[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT
      PrevisionId AS previsionId,
      LotId AS lotId,
      Category AS category,
      Description AS description,
      PlannedDate AS plannedDate,
      PlannedAmountAr AS plannedAmountAr,
      Status AS status,
      RealizedDate AS realizedDate,
      RealizedAmountAr AS realizedAmountAr,
      VarianceAr AS varianceAr,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM dbo.Prevision
      WHERE Status = N'EN_ATTENTE'
      ORDER BY PlannedDate ASC, CreatedAt DESC`);

  return result.recordset;
}

export async function getBudgetSummary(): Promise<{ totalPlannedAr: number; totalRealizedAr: number; varianceAr: number }> {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT
      ISNULL(SUM(PlannedAmountAr), 0) AS totalPlannedAr,
      ISNULL(SUM(RealizedAmountAr), 0) AS totalRealizedAr,
      ISNULL(SUM(CASE WHEN RealizedAmountAr IS NULL THEN 0 ELSE RealizedAmountAr - PlannedAmountAr END), 0) AS varianceAr
      FROM dbo.Prevision`);

  return {
    totalPlannedAr: Number(result.recordset[0]?.totalPlannedAr ?? 0),
    totalRealizedAr: Number(result.recordset[0]?.totalRealizedAr ?? 0),
    varianceAr: Number(result.recordset[0]?.varianceAr ?? 0)
  };
}

export async function create(data: CreatePrevisionDto): Promise<Prevision> {
  const plannedDate = new Date(data.plannedDate);
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, data.lotId ?? null)
    .input('category', sql.NVarChar(30), data.category)
    .input('description', sql.NVarChar(250), data.description)
    .input('plannedDate', sql.Date, plannedDate)
    .input('plannedAmountAr', sql.Decimal(18, 2), data.plannedAmountAr)
    .input('status', sql.NVarChar(20), data.status ?? 'EN_ATTENTE')
    .input('notes', sql.NVarChar(300), data.notes ?? null)
    .query(`INSERT INTO dbo.Prevision
      (LotId, Category, Description, PlannedDate, PlannedAmountAr, Status, Notes, CreatedAt)
      OUTPUT
        INSERTED.PrevisionId AS previsionId,
        INSERTED.LotId AS lotId,
        INSERTED.Category AS category,
        INSERTED.Description AS description,
        INSERTED.PlannedDate AS plannedDate,
        INSERTED.PlannedAmountAr AS plannedAmountAr,
        INSERTED.Status AS status,
        INSERTED.RealizedDate AS realizedDate,
        INSERTED.RealizedAmountAr AS realizedAmountAr,
        INSERTED.VarianceAr AS varianceAr,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt
      VALUES (@lotId, @category, @description, @plannedDate, @plannedAmountAr, @status, @notes, SYSUTCDATETIME())`);

  return result.recordset[0];
}

export async function update(previsionId: number, data: UpdatePrevisionDto): Promise<Prevision> {
  const pool = await getPool();
  const request = pool.request().input('id', sql.BigInt, previsionId);
  const setClauses: string[] = [];

  if (data.lotId !== undefined) {
    setClauses.push('LotId = @lotId');
    request.input('lotId', sql.Int, data.lotId ?? null);
  }
  if (data.category !== undefined) {
    setClauses.push('Category = @category');
    request.input('category', sql.NVarChar(30), data.category);
  }
  if (data.description !== undefined) {
    setClauses.push('Description = @description');
    request.input('description', sql.NVarChar(250), data.description);
  }
  if (data.plannedDate !== undefined) {
    setClauses.push('PlannedDate = @plannedDate');
    request.input('plannedDate', sql.Date, data.plannedDate ? new Date(data.plannedDate) : null);
  }
  if (data.plannedAmountAr !== undefined) {
    setClauses.push('PlannedAmountAr = @plannedAmountAr');
    request.input('plannedAmountAr', sql.Decimal(18, 2), data.plannedAmountAr);
  }
  if (data.status !== undefined) {
    setClauses.push('Status = @status');
    request.input('status', sql.NVarChar(20), data.status);
  }
  if (data.realizedDate !== undefined) {
    setClauses.push('RealizedDate = @realizedDate');
    request.input('realizedDate', sql.Date, data.realizedDate ? new Date(data.realizedDate) : null);
  }
  if (data.realizedAmountAr !== undefined) {
    setClauses.push('RealizedAmountAr = @realizedAmountAr');
    request.input('realizedAmountAr', sql.Decimal(18, 2), data.realizedAmountAr ?? null);
  }
  if (data.notes !== undefined) {
    setClauses.push('Notes = @notes');
    request.input('notes', sql.NVarChar(300), data.notes ?? null);
  }

  if (setClauses.length === 0) {
    const existing = await findById(previsionId);
    if (!existing) {
      throw new Error('Prévision non trouvée');
    }
    return existing;
  }

  const result = await request.query(`UPDATE dbo.Prevision
    SET ${setClauses.join(', ')}
    OUTPUT
      INSERTED.PrevisionId AS previsionId,
      INSERTED.LotId AS lotId,
      INSERTED.Category AS category,
      INSERTED.Description AS description,
      INSERTED.PlannedDate AS plannedDate,
      INSERTED.PlannedAmountAr AS plannedAmountAr,
      INSERTED.Status AS status,
      INSERTED.RealizedDate AS realizedDate,
      INSERTED.RealizedAmountAr AS realizedAmountAr,
      INSERTED.VarianceAr AS varianceAr,
      INSERTED.Notes AS notes,
      INSERTED.CreatedAt AS createdAt
    WHERE PrevisionId = @id`);

  return result.recordset[0];
}

export async function delete$(previsionId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.BigInt, previsionId)
    .query('DELETE FROM dbo.Prevision WHERE PrevisionId = @id');
}
