export interface IChemicalType {
    OrderId?: String,
    ChemicalId?: String,
    ChemicalName: String,
    Specifications: String,
    Origin: String,
    Unit: String,
    Amount: Number,
    Price?: Number,
    ManufacturerId: Number,
    ManufacturerName?: String,
}

export const dummyChemicalData: IChemicalType = {
    "ChemicalId": "",
    "ChemicalName": "",
    "Specifications": "",
    "Origin": "",
    "Unit": "",
    "Amount": 0,
    "ManufacturerId": -1,
}