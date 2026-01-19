from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import io
from .dcf import DCFValuation
from .export import export_dcf_to_excel

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DCFRequest(BaseModel):
    historical_revenue: float
    growth_rate_assumptions: List[float]
    ebit_margin_assumptions: List[float]
    tax_rate: float
    wacc: float
    terminal_growth_rate: float
    shares_outstanding: float
    da_percent_revenue: Optional[float] = 0.05
    capex_percent_revenue: Optional[float] = 0.05
    nwc_percent_revenue: Optional[float] = 0.02
    net_debt: Optional[float] = 0.0
    # New fields
    currency: str = "USD"
    unit: str = ""
    exchange_rate: Optional[float] = 1.0 # Local to USD rate (e.g. 0.012 for INR)

@app.post("/calculate-dcf")
async def calculate_dcf(request: DCFRequest):
    try:
        # Convert Inputs to USD
        # If exchange_rate is provided, we use it to convert Revenue and Net Debt
        exchange_rate = request.exchange_rate if request.exchange_rate else 1.0
        
        usd_revenue = request.historical_revenue * exchange_rate
        usd_net_debt = request.net_debt * exchange_rate # Assuming net_debt comes in local currency

        dcf = DCFValuation(
            historical_revenue=usd_revenue,
            growth_rate_assumptions=request.growth_rate_assumptions,
            ebit_margin_assumptions=request.ebit_margin_assumptions,
            tax_rate=request.tax_rate,
            wacc=request.wacc,
            terminal_growth_rate=request.terminal_growth_rate,
            shares_outstanding=request.shares_outstanding,
            da_percent_revenue=request.da_percent_revenue,
            capex_percent_revenue=request.capex_percent_revenue,
            nwc_percent_revenue=request.nwc_percent_revenue,
            net_debt=usd_net_debt
        )
        
        valuation = dcf.calculate_valuation()
        sensitivity = dcf.sensitivity_analysis()
        projections = valuation["projections"].to_dict(orient="records")
        
        return {
            "share_price": valuation["share_price"],
            "equity_value": valuation["equity_value"],
            "enterprise_value": valuation["enterprise_value"],
            "sensitivity_analysis": sensitivity,
            "projections": projections
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export-dcf")
async def export_dcf(request: DCFRequest):
    try:
        # Convert to USD for Export
        exchange_rate = request.exchange_rate if request.exchange_rate else 1.0
        usd_revenue = request.historical_revenue * exchange_rate
        usd_net_debt = request.net_debt * exchange_rate

        dcf = DCFValuation(
            historical_revenue=usd_revenue,
            growth_rate_assumptions=request.growth_rate_assumptions,
            ebit_margin_assumptions=request.ebit_margin_assumptions,
            tax_rate=request.tax_rate,
            wacc=request.wacc,
            terminal_growth_rate=request.terminal_growth_rate,
            shares_outstanding=request.shares_outstanding,
            da_percent_revenue=request.da_percent_revenue,
            capex_percent_revenue=request.capex_percent_revenue,
            nwc_percent_revenue=request.nwc_percent_revenue,
            net_debt=usd_net_debt
        )
        
        excel_file = export_dcf_to_excel(dcf, request.unit)
        
        headers = {
            'Content-Disposition': 'attachment; filename="dcf_valuation_model_usd.xlsx"'
        }
        
        return StreamingResponse(
            excel_file, 
            headers=headers, 
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
