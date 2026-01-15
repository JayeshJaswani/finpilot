import { PromptConfig, Content } from './interface';

/**
 * Runtime Configuration:
 * This object contains the specific model parameters, system instructions, and
 * tools that the generated application MUST use for its own AI-powered features.
 * Import this object directly into your application code.
 */
export const runtimeConfig: PromptConfig = {
  "title": "Financial Data Assistant",
  "description": "",
  "parameters": {
    "temperature": 1,
    "tokenLimits": 65535,
    "topP": 0.95,
    "groundingPromptConfig": {
      "disabled": false,
      "groundingConfig": {
        "sources": [
          {
            "type": "WEB",
            "googleSearchGroundingConfig": {}
          }
        ]
      }
    },
    "tools": [
      {
        "googleSearch": {}
      }
    ],
    "thinkingBudget": null,
    "thinkingLevel": "HIGH",
    "safetyCatFilters": [
      {
        "category": "HATE_SPEECH",
        "threshold": "OFF"
      },
      {
        "category": "DANGEROUS_CONTENT",
        "threshold": "OFF"
      },
      {
        "category": "SEXUALLY_EXPLICIT_CONTENT",
        "threshold": "OFF"
      },
      {
        "category": "HARASSMENT_CONTENT",
        "threshold": "OFF"
      }
    ]
  },
  "type": "multimodal_chat",
  "examples": [],
  "model": "google/gemini-2.0-flash-thinking-exp"
};

/**
 * Build-Time Context:
 * This chat history is provided as a reference for the model during application
 * generation. It is used to understand the user's intent and the desired
 * functionality of the AI.
 */
export const buildContextMessages: Content[] = [
  {
    "role": "user",
    "parts": [
      {
        "inlineData": {
          "mimeType": "application/pdf",
          "data": "[PDF_DATA_PLACEHOLDER]"
        }
      },
      {
        "text": "\nExtract the revenue, cost of goods sold, and operating expenses from the uploaded PDF and list them"
      }
    ]
  },
  {
    "role": "model",
    "parts": [
      {
        "text": "**Analyzing Financial Data Extraction**\n\nI'm focused on pinpointing the specific financial values the user needs, especially Revenue, COGS, and Operating Expenses, by scouring the financial statements. The \"Statement of Profit and Loss\" on page 3 looks promising for Revenue, and it presents figures for total expenses. However, I must cross-reference this with page 55 to see if it allows the correct categorization of the expenses as the user requires.\n\n\n**Identifying Expense Categorization**\n\nI'm now zeroing in on the presentation of the data, especially regarding the requested categorization. While the initial scan identified the total expenses, the function-wise classification on page 55 is definitely the key to isolating Cost of Sales and Operating Expenses. I must create the format the user requested, ensuring accuracy.\n\n\n\n**Verifying and Preparing Data**\n\nNow I am going over the numbers again to check for accuracy, particularly around the totaling of the data I extract. I also must ensure the formatting matches the user's requirements, specifically regarding the inclusion of both the 2024 and 2025 financial figures. I'll then finalize the output.\n\n\n"
      },
      {
        "text": "Based on **Note 2.28 Function-wise classification of Statement of Profit and Loss** (found on page 55 of the OCR text), here are the extracted financial figures for Infosys Limited (Standalone) for the years ended March 31, 2025, and March 31\n, 2024.\n\nAll figures are in **₹ crore**.\n\n**1. Revenue**\n*   **Revenue from operations (2025):** 136,592\n*   **Revenue from operations (2024):** 128,933\n\n**2. Cost of Goods Sold**\n*   **Cost of sales (2025):** 94,111\n*   **Cost of sales (2024):** 89,032\n\n**3. Operating Expenses**\n*   **Total operating expenses (2025):** 11,601\n*   **Total operating expenses (2024):** 11,088\n\n*Breakdown of Operating Expenses:*\n*   *Selling and marketing expenses:* 6,282 (2025) | 5,668 (2024)\n*   *General and administration expenses:* 5,319 (2025) | 5,420 (2024)"
      }
    ]
  },
  {
    "role": "model",
    "parts": [
      {
        "text": "help me refine this prompt to get a clean JSON output with keys for 'revenue', 'cogs', and 'opex'"
      }
    ]
  },
  {
    "role": "user",
    "parts": [
      {
        "text": "You are a financial data extraction expert.\n\nYour task is to extract the revenue, cost of goods sold, and operating expenses from the uploaded PDF.\n\nYou must provide the output as a single, clean JSON object with the following keys. The values should be numerical, without currency symbols or commas.\n\n{\n  \"revenue\": <number>,\n  \"cogs\": <number>,\n  \"opex\": <number>\n}"
      },
      {
        "inlineData": {
          "mimeType": "application/pdf",
          "data": "[PDF_DATA_PLACEHOLDER]"
        }
      },
      {
        "text": "\n"
      }
    ]
  },
  {
    "role": "model",
    "parts": [
      {
        "text": "**Examining Financial Data**\n\nI'm currently focused on extracting crucial financial data. I've successfully identified the \"Revenue from operations\" figure on both page 3 and page 55, confirming the 2025 revenue as 136,592. Now, I'm shifting my attention to locating the Cost of Goods Sold; I'll be looking for either \"Cost of sales\" or \"Cost of revenue\" within the provided document.\n\n\n**Calculating Key Financials**\n\nI've verified the gross profit and operating profit calculations, confirming the accuracy of the extracted data. My process now focuses on isolating and validating these critical figures for the most recent fiscal year, specifically, calculating 2025 revenue, COGS, and OPEX. The calculations align with the figures on page 55, confirming the reliability of my approach.\n\n\n"
      },
      {
        "text": "```json\n{\n  \"revenue\": 136592,\n  \"cogs\": 94111,\n  \"opex\": 11601\n}\n```"
      }
    ]
  },
  {
    "role": "model",
    "parts": [
      {
        "text": "refine the prompt to consider the currency used in the financial statement, Compare it with the US dollar at current market rates, and get the stock data from the company if available. A ratio and trend analysis should also be performed, displayed with the relevant graphs that show changes in the data provided. Recommendations should also be outputted on how said company can improve their financial performance."
      }
    ]
  },
  {
    "role": "user",
    "parts": [
      {
        "text": "You are a sophisticated financial analyst AI. Your task is a multi-step financial analysis of the uploaded PDF document.\n\nYour goal is to extract key financial data, perform analysis, and provide structured recommendations. You will need to handle currency conversion, calculate key ratios, and generate code for data visualization.\n\n1.  **Data Extraction & Identification**: Extract the revenue, cost of goods sold (COGS), and operating expenses (OPEX). Identify the currency (e.g., EUR, JPY) and the company name and ticker symbol from the document.\n2.  **Analysis**: \n    *   Calculate the Gross Profit (Revenue - COGS) and Operating Income (Gross Profit - OPEX).\n    *   Perform ratio analysis for Gross Margin % and Operating Margin %.\n    *   Provide a brief trend analysis if the document contains data from multiple periods.\n    *   If stock data is provided in the input `{{stock_data}}`, incorporate it into your analysis.\n3.  **Recommendations**: Based on your analysis, provide 2-3 actionable recommendations for the company to improve its financial performance.\n4.  **Visualization**: For visualization, you will generate a Python code snippet using the Matplotlib library to create a bar chart comparing Revenue, COGS, and OPEX. Do not attempt to render the graph.\n\n**Output Format:**\nYou must provide the output as a single, clean JSON object. All numerical values should be numbers, without currency symbols or commas.\n\n**JSON Schema:**\n{\n  \"company_name\": \"<string>\",\n  \"ticker_symbol\": \"<string|null>\",\n  \"currency\": \"<string>\",\n  \"financial_data\": {\n    \"revenue\": <number>,\n    \"cogs\": <number>,\n    \"opex\": <number>\n  },\n  \"analysis\": {\n    \"calculated_metrics\": {\n      \"gross_profit\": <number>,\n      \"operating_income\": <number>\n    },\n    \"ratio_analysis\": {\n      \"gross_margin_percent\": <number>,\n      \"operating_margin_percent\": <number>\n    },\n    \"trend_analysis\": \"<string>\"\n  },\n  \"recommendations\": [\n    \"<string>\",\n    \"<string>\"\n  ],\n  \"visualization_code\": \"<string>\"\n}"
      }
    ]
  },
  {
    "role": "model",
    "parts": [
      {
        "text": "**Framing the Objective**\n\nI'm now zeroing in on the desired JSON structure. The most critical aspect is encapsulating all the analysis within a single, well-organized object. I'm focusing on defining clear sections: Data Extraction, Analysis (broken down further), Recommendations, and Visualization Code.\n\n\n**Refining the Structure**\n\nNow, I'm fleshing out the \"Analysis\" section, meticulously outlining calculations like Gross Profit and Operating Income, and working on defining key financial ratios. I'm focusing on incorporating both 2024 and 2025 data to calculate growth and margins.  The goal is a readily interpretable analysis.\n\n\n**Outlining the Calculations**\n\nI'm presently building the analysis, computing Gross Profit, Operating Income, and crucial financial ratios. Alongside, I'm integrating trend calculations for revenue, cost of sales, and operating profit. My focus is on providing concise summaries to offer actionable insights.\n\n\n**Defining the Output Structure**\n\nI'm presently building the JSON payload, making sure to include comprehensive analysis, including revenue and operating profit, along with margin calculations. I'm focusing on incorporating the 2024 data for the trend analysis. My main task is creating the \"Recommendations\" and \"Visualization Code\" sections now.\n\n\n**Generating the Output**\n\nI'm now putting everything together. I'm taking the extracted data, calculated metrics, ratios, trends, and the recommendations, along with visualization code, and preparing the complete JSON output. I'm focusing on ensuring all the sections are populated according to the guidelines, resulting in a cohesive structure.\n\n\n"
      },
      {
        "text": "```json\n{\n  \"company_name\": \"Infosys Limited\",\n  \"ticker_symbol\": \"INFY\",\n  \"currency\": \"INR\",\n  \"financial_data\": {\n    \"revenue\": 136592,\n    \"cogs\": 94111,\n    \"opex\": 11601\n  },\n  \"analysis\": {\n    \"calculated_metrics\": {\n      \"gross_profit\": 42481,\n      \"operating_income\": 30880\n    },\n    \"ratio_analysis\": {\n      \"gross_margin_percent\": 31.1,\n      \"operating_margin_percent\": 22.61\n    },\n    \"trend_analysis\": \"Comparing FY 2025 to FY 2024, Revenue from operations grew by approximately 5.9% (from 128,933 to 136,592). Operating expenses remained relatively controlled, increasing slightly from 11,088 to 11,601. Consequently, Operating Profit improved from 28,813 to 30,880, demonstrating consistent operational efficiency despite the increase in Cost of Sales.\"\n  },\n  \"recommendations\": [\n    \"Scale the Products and Platforms segment: While Software Services remains the core revenue driver, Products and Platforms showed significant relative growth (from 296 to 1,067). Investing further here could yield higher margin returns compared to traditional services.\",\n    \"Optimize Cost of Sales: COGS represents the largest expense component (approx 69% of revenue). Implementing tighter controls on subcontractor costs and improving employee utilization rates could significantly boost the Gross Margin.\",\n    \"Maintain General Administration Efficiency: General and administration expenses actually decreased slightly year-over-year (from 5,420 to 5,319) despite revenue growth. The company should continue the specific automation or cost-control measures that allowed for this efficiency to offset marketing increases.\"\n  ],\n  \"visualization_code\": \"import matplotlib.pyplot as plt\\n\\n# Data\\ncategories = ['Revenue', 'COGS', 'OPEX']\\nvalues = [136592, 94111, 11601]\\n\\n# Create bar chart\\nplt.figure(figsize=(10, 6))\\nbars = plt.bar(categories, values, color=['#003366', '#d9534f', '#2ca02c'])\\n\\n# Add titles and labels\\nplt.title('Infosys Limited Financial Overview (March 31, 2025)', fontsize=14)\\nplt.ylabel('Amount in INR Crore', fontsize=12)\\nplt.grid(axis='y', linestyle='--', alpha=0.7)\\n\\n# Add value labels on top of bars\\nfor bar in bars:\\n    yval = bar.get_height()\\n    plt.text(bar.get_x() + bar.get_width()/2, yval + 1000, round(yval, 2), \\n             ha='center', va='bottom', fontsize=10, fontweight='bold')\\n\\nplt.show()\"\n}\n```"
      }
    ]
  },
  {
    "role": "model",
    "parts": [
      {
        "text": "refine the prompt to output a time series graph for the trend analysis. The ratio analysis should include the following: Liquidity Ratio, Profitability Ratio, Debt Ratio, and efficiency ratios. A summary of the ratio analysis should be provided as well. The trend analysis should cover the following: Revenue Trends, Profit before tax, Changes in net cash flow, and total assets."
      }
    ]
  },
  {
    "role": "user",
    "parts": [
      {
        "text": "You are a sophisticated financial analyst AI. Your task is a multi-step financial analysis of the uploaded PDF document.\n\nYour goal is to extract key financial data, perform analysis, and provide structured recommendations. You will need to handle currency conversion, calculate key ratios, and generate code for data visualization.\n\n1.  **Data Extraction & Identification**: Extract the revenue, cost of goods sold (COGS), and operating expenses (OPEX). Identify the currency (e.g., EUR, JPY) and the company name and ticker symbol from the document.\n2.  **Analysis**: \n    *   Calculate the Gross Profit (Revenue - COGS) and Operating Income (Gross Profit - OPEX).\n    *   Perform detailed ratio analysis covering: Liquidity Ratios (e.g., Current Ratio), Profitability Ratios (e.g., Gross Margin %, Operating Margin %, Net Profit Margin %), Debt Ratios (e.g., Debt-to-Equity), and Efficiency Ratios (e.g., Asset Turnover). Provide a summary of the key findings from the ratio analysis.\n    *   Provide a detailed trend analysis covering: Revenue trends, Profit Before Tax (PBT) trends, changes in net cash flow from operations, and total asset growth. This should be done if the document contains data from multiple periods.\n    *   If stock data is provided in the input `{{stock_data}}`, incorporate it into your analysis.\n3.  **Recommendations**: Based on your analysis, provide 2-3 actionable recommendations for the company to improve its financial performance.\n4.  **Visualization**: For visualization, you will generate a Python code snippet using the Matplotlib library to create a time series graph for the trend analysis (e.g., plotting Revenue and PBT over time). Do not attempt to render the graph.\n\n**Output Format:**\nYou must provide the output as a single, clean JSON object. All numerical values should be numbers, without currency symbols or commas.\n\n**JSON Schema:**\n{\n  \"company_name\": \"<string>\",\n  \"ticker_symbol\": \"<string|null>\",\n  \"currency\": \"<string>\",\n  \"financial_data\": {\n    \"revenue\": <number>,\n    \"cogs\": <number>,\n    \"opex\": <number>\n  },\n  \"analysis\": {\n    \"calculated_metrics\": {\n      \"gross_profit\": <number>,\n      \"operating_income\": <number>\n    },\n    \"ratio_analysis\": {\n      \"summary\": \"<string>\",\n      \"liquidity_ratios\": { \"<ratio_name>\": <number> },\n      \"profitability_ratios\": { \"<ratio_name>\": <number> },\n      \"debt_ratios\": { \"<ratio_name>\": <number> },\n      \"efficiency_ratios\": { \"<ratio_name>\": <number> }\n    },\n    \"trend_analysis\": {\n      \"summary\": \"<string>\",\n      \"revenue_trend\": \"<string>\",\n      \"pbt_trend\": \"<string>\",\n      \"net_cash_flow_trend\": \"<string>\",\n      \"total_assets_trend\": \"<string>\"\n    }\n  },\n  \"recommendations\": [\n    \"<string>\",\n    \"<string>\"\n  ],\n  \"visualization_code\": \"<string>\"\n}"
      }
    ]
  },
  {
    "role": "model",
    "parts": [
      {
        "text": "**Comprehending the Objective**\n\n\\n\\n\n\nI'm currently focused on dissecting the user's ultimate aim. I need to convert unstructured text from a PDF into a structured JSON output. I'm prioritizing the extraction of key financial data points, calculations, and analysis components, like ratios and trends. Python will be my tool to achieve this structured transformation.\n\n\n**Refining Data Extraction Strategy**\n\n\\n\\n\n\nMy focus is narrowing on the specifics of the data extraction. I'm building a robust approach. I'm concentrating on identifying the exact page locations within the PDF where crucial financial data resides. This includes pinpointing assets and liabilities on page 2, the P&L details on page 3, and cash flow on page 6. Additionally, I am formulating a methodical strategy to gather pre-calculated ratios and revenue breakdowns from pages 54 and 55, respectively.\n\n\n**Outlining Data Processing Steps**\n\n\\n\\n\n\nI'm now detailing the step-by-step process. First, I will extract company information and key financial data like revenue, COGS, and OPEX. Following this, I plan to calculate metrics such as Gross Profit and Operating Income. Next, I will populate the ratios, referencing Note 2.27 on Page 54. Finally, I will identify currency and period information to establish context.\n\n\n**Defining Data Structures and Steps**\n\n\\n\\n\n\nMy current thinking centers on the JSON output's structure, focusing on key elements like company details, period, and currency. Then comes the financial data and calculations, broken down into categories: liquidity, profitability, debt, and efficiency. Next, I am creating a way to include trend analyses comparing 2025 and 2024 results. Finally, I will encapsulate all this information to formulate concrete business recommendations.\n\n\n**Defining the Extraction Process**\n\n\\n\\n\n\nMy current thinking revolves around the practical extraction of crucial data. I'm focusing on deriving values such as Revenue, COGS, and operating expenses from their source locations. Then, I'll calculate metrics like Gross Profit and Operating Income, followed by the use of the pre-calculated ratios. I am also planning to identify the currency and the relevant time period.\n\n\n"
      },
      {
        "text": "```json\n{\n  \"company_name\": \"Infosys Limited\",\n  \"ticker_symbol\": \"INFY\",\n  \"currency\": \"INR\",\n  \"financial_data\": {\n    \"revenue\": 136592,\n    \"cogs\": 94111,\n    \"opex\": 11601\n  },\n  \"analysis\": {\n    \"calculated_metrics\": {\n      \"gross_profit\": 42481,\n      \"operating_income\": 30880\n    },\n    \"ratio_analysis\": {\n      \"summary\": \"Infosys maintains a fortress balance sheet with zero debt and strong liquidity. However, profitability margins have contracted slightly year-over-year. The Return on Equity (ROE) decreased from 36.6% to 30.3%, and Net Profit Margin dropped from 21.1% to 18.7%, largely driven by increased tax expenses and a slight dip in Profit Before Tax despite top-line growth.\",\n      \"liquidity_ratios\": {\n        \"current_ratio\": 2.4,\n        \"cash_ratio\": 1.48\n      },\n      \"profitability_ratios\": {\n        \"gross_margin_percent\": 31.1,\n        \"operating_margin_percent\": 22.61,\n        \"net_profit_margin_percent\": 18.7,\n        \"return_on_equity_percent\": 30.3,\n        \"return_on_capital_employed_percent\": 38.9\n      },\n      \"debt_ratios\": {\n        \"debt_to_equity\": 0.0,\n        \"debt_service_coverage_ratio\": 33.9\n      },\n      \"efficiency_ratios\": {\n        \"trade_receivables_turnover\": 5.3,\n        \"net_capital_turnover\": 3.0\n      }\n    },\n    \"trend_analysis\": {\n      \"summary\": \"The company demonstrated solid top-line growth and impressive cash flow generation, although bottom-line profitability was pressured by tax expenses.\",\n      \"revenue_trend\": \"Revenue grew by approximately 5.9% year-over-year, rising from 128,933 Cr in 2024 to 136,592 Cr in 2025.\",\n      \"pbt_trend\": \"Profit Before Tax (PBT) saw a slight decline of 1.4%, dropping from 35,953 Cr in 2024 to 35,441 Cr in 2025, indicating that expense growth slightly outpaced revenue growth.\",\n      \"net_cash_flow_trend\": \"Net cash generated by operating activities saw a substantial increase of 41.5%, jumping from 20,787 Cr in 2024 to 29,409 Cr in 2025, indicating significantly improved working capital management.\",\n      \"total_assets_trend\": \"Total assets grew by 8.7% from 114,950 Cr to 124,936 Cr, driven largely by increases in cash equivalents and other financial assets.\"\n    }\n  },\n  \"recommendations\": [\n    \"Address Margin Compression: With the Net Profit Margin dropping from 21.1% to 18.7% and ROE declining, management should conduct a rigorous cost-benefit analysis of the rising Cost of Sales (up ~5.7%) and investigate tax efficiency strategies, as income tax expense rose significantly (from 8,719 Cr to 9,873 Cr).\",\n    \"Capitalize on Strong Cash Position: The company has generated significantly higher operating cash flow (29,409 Cr). Management should consider accelerating strategic acquisitions to bolster the 'Products and Platforms' segment (which grew from 296 Cr to 1,067 Cr) or increasing shareholder returns via buybacks, given the zero-debt status.\",\n    \"Improve Asset Efficiency: While the Net Capital Turnover ratio improved slightly to 3.0, the Trade Receivables Turnover slowed slightly from 5.6 to 5.3. Tighter credit control and faster collection cycles could further enhance the already strong cash position.\"\n  ],\n  \"visualization_code\": \"import matplotlib.pyplot as plt\\n\\n# Data for plotting\\nyears = ['2024', '2025']\\nrevenue = [128933, 136592]\\npbt = [35953, 35441]\\n\\n# Create figure and axis objects\\nfig, ax1 = plt.subplots(figsize=(10, 6))\\n\\n# Plot Revenue on the left y-axis\\ncolor = 'tab:blue'\\nax1.set_xlabel('Fiscal Year')\\nax1.set_ylabel('Revenue (INR Crore)', color=color)\\nax1.bar(years, revenue, color=color, alpha=0.6, width=0.4, label='Revenue')\\nax1.tick_params(axis='y', labelcolor=color)\\n\\n# Create a second y-axis for PBT\\nax2 = ax1.twinx()\\ncolor = 'tab:red'\\nax2.set_ylabel('Profit Before Tax (INR Crore)', color=color)\\nax2.plot(years, pbt, color=color, marker='o', linewidth=2, label='PBT')\\nax2.tick_params(axis='y', labelcolor=color)\\n\\n# Title and Layout\\nplt.title('Infosys: Revenue vs. Profit Before Tax Trend (2024-2025)')\\nfig.tight_layout()\\n\\nplt.show()\"\n}\n```"
      }
    ]
  }
];
