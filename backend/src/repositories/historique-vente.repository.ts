import sql from 'mssql';
import { getPool } from '../config/database.config';
import { CreateHistoriqueVenteDto, HistoriqueVente } from '../models/historique-gain.model';

export async function findAll(): Promise<HistoriqueVente[]> {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT
      HistoriqueVenteId AS historiqueVenteId,
      ProductionId AS productionId,
      LotId AS lotId,
      SaleDate AS saleDate,
      ProductType AS productType,
      Quantity AS quantity,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      EstimatedCostAr AS estimatedCostAr,
      ProfitAr AS profitAr,
      CustomerName AS customerName,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM dbo.HistoriqueVente
      ORDER BY SaleDate DESC, CreatedAt DESC`);

  return result.recordset;
}

export async function findById(historiqueVenteId: number): Promise<HistoriqueVente | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.BigInt, historiqueVenteId)
    .query(`SELECT
      HistoriqueVenteId AS historiqueVenteId,
      ProductionId AS productionId,
      LotId AS lotId,
      SaleDate AS saleDate,
      ProductType AS productType,
      Quantity AS quantity,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      EstimatedCostAr AS estimatedCostAr,
      ProfitAr AS profitAr,
      CustomerName AS customerName,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM dbo.HistoriqueVente
      WHERE HistoriqueVenteId = @id`);

  return result.recordset[0] ?? null;
}

export async function findByLot(lotId: number): Promise<HistoriqueVente[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .query(`SELECT
      HistoriqueVenteId AS historiqueVenteId,
      ProductionId AS productionId,
      LotId AS lotId,
      SaleDate AS saleDate,
      ProductType AS productType,
      Quantity AS quantity,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      EstimatedCostAr AS estimatedCostAr,
      ProfitAr AS profitAr,
      CustomerName AS customerName,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM dbo.HistoriqueVente
      WHERE LotId = @lotId
      ORDER BY SaleDate DESC, CreatedAt DESC`);

  return result.recordset;
}

export async function findByDateRange(startDate: Date, endDate: Date): Promise<HistoriqueVente[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('startDate', sql.Date, startDate)
    .input('endDate', sql.Date, endDate)
    .query(`SELECT
      HistoriqueVenteId AS historiqueVenteId,
      ProductionId AS productionId,
      LotId AS lotId,
      SaleDate AS saleDate,
      ProductType AS productType,
      Quantity AS quantity,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      EstimatedCostAr AS estimatedCostAr,
      ProfitAr AS profitAr,
      CustomerName AS customerName,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM dbo.HistoriqueVente
      WHERE SaleDate BETWEEN @startDate AND @endDate
      ORDER BY SaleDate DESC, CreatedAt DESC`);

  return result.recordset;
}

export async function getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
  const pool = await getPool();
  const request = pool.request();

  let whereClause = '';
  if (startDate && endDate) {
    whereClause = 'WHERE SaleDate BETWEEN @startDate AND @endDate';
    request.input('startDate', sql.Date, startDate);
    request.input('endDate', sql.Date, endDate);
  }

  const result = await request.query(`SELECT ISNULL(SUM(TotalAmountAr), 0) AS totalRevenue
    FROM dbo.HistoriqueVente
    ${whereClause}`);

  return Number(result.recordset[0]?.totalRevenue ?? 0);
}

export async function create(data: CreateHistoriqueVenteDto): Promise<HistoriqueVente> {
  const saleDate = data.saleDate ? new Date(data.saleDate) : new Date();
  const pool = await getPool();

  const result = await pool.request()
    .input('productionId', sql.BigInt, data.productionId)
    .input('lotId', sql.Int, data.lotId ?? null)
    .input('saleDate', sql.Date, saleDate)
    .input('productType', sql.NVarChar(20), data.productType)
    .input('quantity', sql.Int, data.quantity)
    .input('unitPriceAr', sql.Decimal(18, 2), data.unitPriceAr)
    .input('estimatedCostAr', sql.Decimal(18, 2), data.estimatedCostAr ?? null)
    .input('customerName', sql.NVarChar(150), data.customerName ?? null)
    .input('notes', sql.NVarChar(300), data.notes ?? null)
    .query(`INSERT INTO dbo.HistoriqueVente
      (ProductionId, LotId, SaleDate, ProductType, Quantity, UnitPriceAr, EstimatedCostAr, CustomerName, Notes, CreatedAt)
      OUTPUT
        INSERTED.HistoriqueVenteId AS historiqueVenteId,
        INSERTED.ProductionId AS productionId,
        INSERTED.LotId AS lotId,
        INSERTED.SaleDate AS saleDate,
        INSERTED.ProductType AS productType,
        INSERTED.Quantity AS quantity,
        INSERTED.UnitPriceAr AS unitPriceAr,
        INSERTED.TotalAmountAr AS totalAmountAr,
        INSERTED.EstimatedCostAr AS estimatedCostAr,
        INSERTED.ProfitAr AS profitAr,
        INSERTED.CustomerName AS customerName,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt
      VALUES (@productionId, @lotId, @saleDate, @productType, @quantity, @unitPriceAr, @estimatedCostAr, @customerName, @notes, SYSUTCDATETIME())`);

  return result.recordset[0];
}

export async function delete_(historiqueVenteId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.BigInt, historiqueVenteId)
    .query('DELETE FROM dbo.HistoriqueVente WHERE HistoriqueVenteId = @id');
}
