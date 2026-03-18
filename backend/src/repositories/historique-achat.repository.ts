import sql from 'mssql';
import { getPool } from '../config/database.config';
import { CreateHistoriqueAchatDto, HistoriqueAchat } from '../models/historique-perte.model';

export async function findAll(): Promise<HistoriqueAchat[]> {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT
      HistoriqueAchatId AS historiqueAchatId,
      LotId AS lotId,
      PrevisionId AS previsionId,
      PurchaseDate AS purchaseDate,
      Category AS category,
      ItemName AS itemName,
      Quantity AS quantity,
      Unit AS unit,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      SupplierName AS supplierName,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM dbo.HistoriqueAchat
      ORDER BY PurchaseDate DESC, CreatedAt DESC`);

  return result.recordset;
}

export async function findById(historiqueAchatId: number): Promise<HistoriqueAchat | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.BigInt, historiqueAchatId)
    .query(`SELECT
      HistoriqueAchatId AS historiqueAchatId,
      LotId AS lotId,
      PrevisionId AS previsionId,
      PurchaseDate AS purchaseDate,
      Category AS category,
      ItemName AS itemName,
      Quantity AS quantity,
      Unit AS unit,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      SupplierName AS supplierName,
      Notes AS notes,
      CreatedAt AS createdAt
        FROM dbo.HistoriqueAchat
      WHERE HistoriqueAchatId = @id`);

  return result.recordset[0] ?? null;
}

export async function findByCategory(category: string): Promise<HistoriqueAchat[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('category', sql.NVarChar(30), category)
    .query(`SELECT
      HistoriqueAchatId AS historiqueAchatId,
      LotId AS lotId,
      PrevisionId AS previsionId,
      PurchaseDate AS purchaseDate,
      Category AS category,
      ItemName AS itemName,
      Quantity AS quantity,
      Unit AS unit,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      SupplierName AS supplierName,
      Notes AS notes,
      CreatedAt AS createdAt
        FROM dbo.HistoriqueAchat
      WHERE Category = @category
      ORDER BY PurchaseDate DESC, CreatedAt DESC`);

  return result.recordset;
}

export async function findByDateRange(startDate: Date, endDate: Date): Promise<HistoriqueAchat[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('startDate', sql.Date, startDate)
    .input('endDate', sql.Date, endDate)
    .query(`SELECT
      HistoriqueAchatId AS historiqueAchatId,
      LotId AS lotId,
      PrevisionId AS previsionId,
      PurchaseDate AS purchaseDate,
      Category AS category,
      ItemName AS itemName,
      Quantity AS quantity,
      Unit AS unit,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      SupplierName AS supplierName,
      Notes AS notes,
      CreatedAt AS createdAt
        FROM dbo.HistoriqueAchat
      WHERE PurchaseDate BETWEEN @startDate AND @endDate
      ORDER BY PurchaseDate DESC, CreatedAt DESC`);

  return result.recordset;
}

export async function getTotalExpenses(startDate?: Date, endDate?: Date): Promise<number> {
  const pool = await getPool();
  const request = pool.request();

  let whereClause = '';
  if (startDate && endDate) {
    whereClause = 'WHERE PurchaseDate BETWEEN @startDate AND @endDate';
    request.input('startDate', sql.Date, startDate);
    request.input('endDate', sql.Date, endDate);
  }

  const result = await request.query(`SELECT
      ISNULL(SUM(CASE
        WHEN TotalAmountAr IS NULL THEN 0
        ELSE TotalAmountAr
      END), 0) AS totalExpenses
        FROM dbo.HistoriqueAchat
      ${whereClause}`);

  return Number(result.recordset[0]?.totalExpenses ?? 0);
}

export async function create(data: CreateHistoriqueAchatDto): Promise<HistoriqueAchat> {
  const purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : new Date();

  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, data.lotId ?? null)
    .input('previsionId', sql.BigInt, data.previsionId ?? null)
    .input('purchaseDate', sql.Date, purchaseDate)
    .input('category', sql.NVarChar(30), data.category)
    .input('itemName', sql.NVarChar(120), data.itemName)
    .input('quantity', sql.Decimal(12, 3), data.quantity ?? null)
    .input('unit', sql.NVarChar(20), data.unit ?? null)
    .input('unitPriceAr', sql.Decimal(18, 2), data.unitPriceAr ?? null)
    .input('supplierName', sql.NVarChar(150), data.supplierName ?? null)
    .input('notes', sql.NVarChar(300), data.notes ?? null)
    .query(`INSERT INTO HistoriqueAchat
      (LotId, PrevisionId, PurchaseDate, Category, ItemName, Quantity, Unit, UnitPriceAr, SupplierName, Notes, CreatedAt)
      OUTPUT
        INSERTED.HistoriqueAchatId AS historiqueAchatId,
        INSERTED.LotId AS lotId,
        INSERTED.PrevisionId AS previsionId,
        INSERTED.PurchaseDate AS purchaseDate,
        INSERTED.Category AS category,
        INSERTED.ItemName AS itemName,
        INSERTED.Quantity AS quantity,
        INSERTED.Unit AS unit,
        INSERTED.UnitPriceAr AS unitPriceAr,
        INSERTED.TotalAmountAr AS totalAmountAr,
        INSERTED.SupplierName AS supplierName,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt
      VALUES (@lotId, @previsionId, @purchaseDate, @category, @itemName, @quantity, @unit, @unitPriceAr, @supplierName, @notes, SYSUTCDATETIME())`);

  return result.recordset[0];
}

export async function delete_(historiqueAchatId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.BigInt, historiqueAchatId)
      .query('DELETE FROM dbo.HistoriqueAchat WHERE HistoriqueAchatId = @id');
}
