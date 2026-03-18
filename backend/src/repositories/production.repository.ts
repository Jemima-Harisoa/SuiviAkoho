import sql from 'mssql';
import { getPool } from '../config/database.config';
import { CreateProductionDto, Production, UpdateProductionDto } from '../models/production.model';

export async function findAll(): Promise<Production[]> {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT
    ProductionId AS productionId,
    LotId AS lotId,
    ProductType AS productType,
    AvailableQuantity AS availableQuantity,
    Unit AS unit,
    UnitPriceAr AS unitPriceAr,
    IsActive AS isActive,
    LastUpdateAt AS lastUpdateAt,
    CreatedAt AS createdAt
    FROM dbo.Production
    ORDER BY CreatedAt DESC`);
  return result.recordset;
}

export async function findById(productionId: number): Promise<Production | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.BigInt, productionId)
    .query(`SELECT
      ProductionId AS productionId,
      LotId AS lotId,
      ProductType AS productType,
      AvailableQuantity AS availableQuantity,
      Unit AS unit,
      UnitPriceAr AS unitPriceAr,
      IsActive AS isActive,
      LastUpdateAt AS lastUpdateAt,
      CreatedAt AS createdAt
      FROM dbo.Production
      WHERE ProductionId = @id`);

  return result.recordset[0] ?? null;
}

export async function findByLot(lotId: number): Promise<Production[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .query(`SELECT
      ProductionId AS productionId,
      LotId AS lotId,
      ProductType AS productType,
      AvailableQuantity AS availableQuantity,
      Unit AS unit,
      UnitPriceAr AS unitPriceAr,
      IsActive AS isActive,
      LastUpdateAt AS lastUpdateAt,
      CreatedAt AS createdAt
      FROM dbo.Production
      WHERE LotId = @lotId
      ORDER BY CreatedAt DESC`);

  return result.recordset;
}

export async function findAvailableStock(): Promise<Production[]> {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT
      ProductionId AS productionId,
      LotId AS lotId,
      ProductType AS productType,
      AvailableQuantity AS availableQuantity,
      Unit AS unit,
      UnitPriceAr AS unitPriceAr,
      IsActive AS isActive,
      LastUpdateAt AS lastUpdateAt,
      CreatedAt AS createdAt
      FROM dbo.Production
      WHERE IsActive = 1 AND AvailableQuantity > 0
      ORDER BY LastUpdateAt DESC`);

  return result.recordset;
}

export async function getTotalStockValue(): Promise<number> {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT
      ISNULL(SUM(CASE WHEN UnitPriceAr IS NULL THEN 0 ELSE AvailableQuantity * UnitPriceAr END), 0) AS totalStockValue
      FROM dbo.Production
      WHERE IsActive = 1 AND AvailableQuantity > 0`);

  return Number(result.recordset[0]?.totalStockValue ?? 0);
}

export async function create(data: CreateProductionDto): Promise<Production> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, data.lotId ?? null)
    .input('productType', sql.NVarChar(20), data.productType)
    .input('availableQuantity', sql.Int, data.availableQuantity)
    .input('unit', sql.NVarChar(20), data.unit ?? 'PIECE')
    .input('unitPriceAr', sql.Decimal(18, 2), data.unitPriceAr ?? null)
    .input('isActive', sql.Bit, data.isActive ?? true)
    .query(`INSERT INTO dbo.Production
      (LotId, ProductType, AvailableQuantity, Unit, UnitPriceAr, IsActive, LastUpdateAt, CreatedAt)
      OUTPUT
        INSERTED.ProductionId AS productionId,
        INSERTED.LotId AS lotId,
        INSERTED.ProductType AS productType,
        INSERTED.AvailableQuantity AS availableQuantity,
        INSERTED.Unit AS unit,
        INSERTED.UnitPriceAr AS unitPriceAr,
        INSERTED.IsActive AS isActive,
        INSERTED.LastUpdateAt AS lastUpdateAt,
        INSERTED.CreatedAt AS createdAt
      VALUES (@lotId, @productType, @availableQuantity, @unit, @unitPriceAr, @isActive, SYSUTCDATETIME(), SYSUTCDATETIME())`);

  return result.recordset[0];
}

export async function update(productionId: number, data: UpdateProductionDto): Promise<Production> {
  const pool = await getPool();
  const request = pool.request().input('id', sql.BigInt, productionId);
  const setClauses: string[] = [];

  if (data.lotId !== undefined) {
    setClauses.push('LotId = @lotId');
    request.input('lotId', sql.Int, data.lotId ?? null);
  }
  if (data.productType !== undefined) {
    setClauses.push('ProductType = @productType');
    request.input('productType', sql.NVarChar(20), data.productType);
  }
  if (data.availableQuantity !== undefined) {
    setClauses.push('AvailableQuantity = @availableQuantity');
    request.input('availableQuantity', sql.Int, data.availableQuantity);
  }
  if (data.unit !== undefined) {
    setClauses.push('Unit = @unit');
    request.input('unit', sql.NVarChar(20), data.unit);
  }
  if (data.unitPriceAr !== undefined) {
    setClauses.push('UnitPriceAr = @unitPriceAr');
    request.input('unitPriceAr', sql.Decimal(18, 2), data.unitPriceAr ?? null);
  }
  if (data.isActive !== undefined) {
    setClauses.push('IsActive = @isActive');
    request.input('isActive', sql.Bit, data.isActive);
  }

  if (setClauses.length === 0) {
    const existing = await findById(productionId);
    if (!existing) {
      throw new Error('Production non trouvée');
    }
    return existing;
  }

  setClauses.push('LastUpdateAt = SYSUTCDATETIME()');

  const result = await request.query(`UPDATE dbo.Production
    SET ${setClauses.join(', ')}
    OUTPUT
      INSERTED.ProductionId AS productionId,
      INSERTED.LotId AS lotId,
      INSERTED.ProductType AS productType,
      INSERTED.AvailableQuantity AS availableQuantity,
      INSERTED.Unit AS unit,
      INSERTED.UnitPriceAr AS unitPriceAr,
      INSERTED.IsActive AS isActive,
      INSERTED.LastUpdateAt AS lastUpdateAt,
      INSERTED.CreatedAt AS createdAt
    WHERE ProductionId = @id`);

  return result.recordset[0];
}

export async function delete$(productionId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.BigInt, productionId)
    .query('DELETE FROM dbo.Production WHERE ProductionId = @id');
}
