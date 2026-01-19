from typing import List, Dict, Optional
import pandas as pd
import numpy as np

class DCFValuation:
    def __init__(
        self,
        historical_revenue: float,
        growth_rate_assumptions: List[float],  # 5 years
        ebit_margin_assumptions: List[float],  # 5 years
        tax_rate: float,
        wacc: float,
        terminal_growth_rate: float,
        shares_outstanding: float,
        da_percent_revenue: float = 0.05,  # Default 5%
        capex_percent_revenue: float = 0.05,  # Default 5%
        nwc_percent_revenue: float = 0.02,  # Default 2%
        net_debt: float = 0.0
    ):
        self.historical_revenue = historical_revenue
        self.growth_rates = growth_rate_assumptions
        self.ebit_margins = ebit_margin_assumptions
        self.tax_rate = tax_rate
        self.wacc = wacc
        self.terminal_growth_rate = terminal_growth_rate
        self.shares_outstanding = shares_outstanding
        self.da_percent = da_percent_revenue
        self.capex_percent = capex_percent_revenue
        self.nwc_percent = nwc_percent_revenue
        self.net_debt = net_debt

        if len(self.growth_rates) != 5 or len(self.ebit_margins) != 5:
            raise ValueError("Growth rates and EBIT margins must be provided for exactly 5 years.")

    def calculate_projections(self) -> pd.DataFrame:
        years = list(range(1, 6))
        
        # Calculate Revenue
        revenues = []
        current_revenue = self.historical_revenue
        for g in self.growth_rates:
            current_revenue *= (1 + g)
            revenues.append(current_revenue)

        # Calculate EBIT
        ebits = [rev * margin for rev, margin in zip(revenues, self.ebit_margins)]

        # Calculate Tax
        taxes = [ebit * self.tax_rate for ebit in ebits]

        # Calculate NOPAT
        nopats = [ebit - tax for ebit, tax in zip(ebits, taxes)]

        # Calculate D&A, CapEx, Change in NWC
        das = [rev * self.da_percent for rev in revenues]
        capexs = [rev * self.capex_percent for rev in revenues]
        
        # Change in NWC calculation (Simplified: NWC of this year - NWC of last year)
        # Assuming Year 0 NWC was also based on same % of historical revenue
        nwcs = [rev * self.nwc_percent for rev in revenues]
        prior_nwc = self.historical_revenue * self.nwc_percent
        change_in_nwcs = []
        for nwc in nwcs:
            change = nwc - prior_nwc
            change_in_nwcs.append(change)
            prior_nwc = nwc # Update for next year

        # Calculate UFCF
        ufcfs = []
        for i in range(5):
            # UFCF = NOPAT + D&A - CapEx - Change in NWC
            ufcf = nopats[i] + das[i] - capexs[i] - change_in_nwcs[i]
            ufcfs.append(ufcf)

        # Discount Factors
        discount_factors = [1 / ((1 + self.wacc) ** y) for y in years]

        # Present Values
        pv_ufcfs = [ufcf * df for ufcf, df in zip(ufcfs, discount_factors)]

        data = {
            "Year": years,
            "Revenue": revenues,
            "Growth Rate": self.growth_rates,
            "EBIT Margin": self.ebit_margins,
            "EBIT": ebits,
            "Tax": taxes,
            "NOPAT": nopats,
            "D&A": das,
            "CapEx": capexs,
            "Change in NWC": change_in_nwcs,
            "UFCF": ufcfs,
            "Discount Factor": discount_factors,
            "PV of UFCF": pv_ufcfs
        }
        return pd.DataFrame(data)

    def calculate_valuation(self):
        df = self.calculate_projections()
        
        # Terminal Value (Gordon Growth)
        final_year_ufcf = df["UFCF"].iloc[-1]
        terminal_value = (final_year_ufcf * (1 + self.terminal_growth_rate)) / (self.wacc - self.terminal_growth_rate)
        
        # PV of Terminal Value
        pv_terminal_value = terminal_value / ((1 + self.wacc) ** 5)
        
        # Enterprise Value
        sum_pv_ufcf = df["PV of UFCF"].sum()
        enterprise_value = sum_pv_ufcf + pv_terminal_value
        
        # Equity Value
        equity_value = enterprise_value - self.net_debt
        
        # Share Price
        share_price = equity_value / self.shares_outstanding

        return {
            "projections": df,
            "terminal_value": terminal_value,
            "pv_terminal_value": pv_terminal_value,
            "sum_pv_ufcf": sum_pv_ufcf,
            "enterprise_value": enterprise_value,
            "equity_value": equity_value,
            "share_price": share_price
        }

    def sensitivity_analysis(self) -> Dict[str, Dict[str, float]]:
        # Vary WACC by +/- 1% and 0.5%
        # Vary Terminal Growth by +/- 1% and 0.5%
        
        wacc_range = [self.wacc - 0.01, self.wacc - 0.005, self.wacc, self.wacc + 0.005, self.wacc + 0.01]
        g_range = [self.terminal_growth_rate - 0.01, self.terminal_growth_rate - 0.005, self.terminal_growth_rate, self.terminal_growth_rate + 0.005, self.terminal_growth_rate + 0.01]
        
        sensitivity_matrix = {}
        
        # Save original state
        original_wacc = self.wacc
        original_g = self.terminal_growth_rate
        
        for w in wacc_range:
            row_label = f"WACC {w:.1%}"
            sensitivity_matrix[row_label] = {}
            self.wacc = w
            for g in g_range:
                col_label = f"g {g:.1%}"
                self.terminal_growth_rate = g
                try:
                    val = self.calculate_valuation()
                    sensitivity_matrix[row_label][col_label] = round(val["share_price"], 2)
                except:
                     sensitivity_matrix[row_label][col_label] = 0.0

        # Restore original state
        self.wacc = original_wacc
        self.terminal_growth_rate = original_g
        
        return sensitivity_matrix
