/**
 * Historical annual returns data from Aswath Damodaran, NYU Stern.
 * Source: https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html
 * "Historical Returns on Stocks, Bonds and Bills - United States"
 *
 * Columns:
 *   year    - calendar year
 *   sp500   - S&P 500 total return (nominal, including dividends)
 *   tbill   - 3-month T-Bill return
 *   tbond   - 10-year U.S. Treasury Bond total return (price + coupon)
 *   cpi     - U.S. CPI inflation rate
 *
 * Real returns can be computed as: (1 + nominal) / (1 + cpi) - 1
 */

export interface YearData {
  year: number;
  sp500: number; // nominal total return
  tbill: number; // 3-month T-Bill rate
  tbond: number; // 10-year T-Bond total return
  cpi: number;   // CPI inflation rate
}

export const historicalReturns: YearData[] = [
  { year: 1928, sp500:  0.4381, tbill: 0.0308, tbond:  0.0084, cpi: -0.0116 },
  { year: 1929, sp500: -0.0830, tbill: 0.0316, tbond:  0.0420, cpi:  0.0058 },
  { year: 1930, sp500: -0.2490, tbill: 0.0455, tbond:  0.0454, cpi: -0.0640 },
  { year: 1931, sp500: -0.4334, tbill: 0.0231, tbond: -0.0256, cpi: -0.0932 },
  { year: 1932, sp500: -0.0819, tbill: 0.0107, tbond:  0.0879, cpi: -0.1027 },
  { year: 1933, sp500:  0.5399, tbill: 0.0096, tbond:  0.0166, cpi:  0.0076 },
  { year: 1934, sp500: -0.0144, tbill: 0.0032, tbond:  0.0780, cpi:  0.0152 },
  { year: 1935, sp500:  0.4767, tbill: 0.0018, tbond:  0.0481, cpi:  0.0298 },
  { year: 1936, sp500:  0.3392, tbill: 0.0017, tbond:  0.0751, cpi:  0.0145 },
  { year: 1937, sp500: -0.3503, tbill: 0.0031, tbond:  0.0023, cpi:  0.0290 },
  { year: 1938, sp500:  0.3112, tbill: 0.0008, tbond:  0.0553, cpi: -0.0278 },
  { year: 1939, sp500: -0.0041, tbill: 0.0006, tbond:  0.0447, cpi:  0.0000 },
  { year: 1940, sp500: -0.0978, tbill: 0.0004, tbond:  0.0609, cpi:  0.0071 },
  { year: 1941, sp500: -0.1159, tbill: 0.0008, tbond: -0.0002, cpi:  0.0990 },
  { year: 1942, sp500:  0.2034, tbill: 0.0035, tbond:  0.0322, cpi:  0.0905 },
  { year: 1943, sp500:  0.2590, tbill: 0.0038, tbond:  0.0208, cpi:  0.0306 },
  { year: 1944, sp500:  0.1975, tbill: 0.0038, tbond:  0.0281, cpi:  0.0218 },
  { year: 1945, sp500:  0.3644, tbill: 0.0038, tbond:  0.1073, cpi:  0.0222 },
  { year: 1946, sp500: -0.0807, tbill: 0.0038, tbond:  0.0346, cpi:  0.1842 },
  { year: 1947, sp500:  0.0571, tbill: 0.0062, tbond: -0.0102, cpi:  0.0891 },
  { year: 1948, sp500:  0.0550, tbill: 0.0107, tbond:  0.0340, cpi:  0.0289 },
  { year: 1949, sp500:  0.1879, tbill: 0.0111, tbond:  0.0645, cpi: -0.0197 },
  { year: 1950, sp500:  0.3171, tbill: 0.0120, tbond:  0.0006, cpi:  0.0579 },
  { year: 1951, sp500:  0.2402, tbill: 0.0149, tbond: -0.0394, cpi:  0.0587 },
  { year: 1952, sp500:  0.1837, tbill: 0.0166, tbond:  0.0163, cpi:  0.0088 },
  { year: 1953, sp500: -0.0099, tbill: 0.0182, tbond:  0.0363, cpi:  0.0075 },
  { year: 1954, sp500:  0.5262, tbill: 0.0086, tbond:  0.0719, cpi: -0.0074 },
  { year: 1955, sp500:  0.3156, tbill: 0.0157, tbond: -0.0130, cpi:  0.0037 },
  { year: 1956, sp500:  0.0656, tbill: 0.0246, tbond: -0.0536, cpi:  0.0299 },
  { year: 1957, sp500: -0.1078, tbill: 0.0314, tbond:  0.0789, cpi:  0.0288 },
  { year: 1958, sp500:  0.4336, tbill: 0.0154, tbond: -0.0605, cpi:  0.0176 },
  { year: 1959, sp500:  0.1196, tbill: 0.0295, tbond: -0.0226, cpi:  0.0150 },
  { year: 1960, sp500:  0.0047, tbill: 0.0266, tbond:  0.1178, cpi:  0.0148 },
  { year: 1961, sp500:  0.2689, tbill: 0.0213, tbond:  0.0285, cpi:  0.0067 },
  { year: 1962, sp500: -0.0873, tbill: 0.0273, tbond:  0.0594, cpi:  0.0134 },
  { year: 1963, sp500:  0.2280, tbill: 0.0314, tbond:  0.0196, cpi:  0.0163 },
  { year: 1964, sp500:  0.1648, tbill: 0.0354, tbond:  0.0374, cpi:  0.0098 },
  { year: 1965, sp500:  0.1245, tbill: 0.0393, tbond:  0.0072, cpi:  0.0193 },
  { year: 1966, sp500: -0.1006, tbill: 0.0477, tbond:  0.0265, cpi:  0.0344 },
  { year: 1967, sp500:  0.2398, tbill: 0.0431, tbond: -0.0919, cpi:  0.0304 },
  { year: 1968, sp500:  0.1106, tbill: 0.0566, tbond:  0.0257, cpi:  0.0472 },
  { year: 1969, sp500: -0.0850, tbill: 0.0660, tbond: -0.0508, cpi:  0.0611 },
  { year: 1970, sp500:  0.0401, tbill: 0.0642, tbond:  0.1221, cpi:  0.0549 },
  { year: 1971, sp500:  0.1431, tbill: 0.0439, tbond:  0.1315, cpi:  0.0336 },
  { year: 1972, sp500:  0.1898, tbill: 0.0408, tbond:  0.0558, cpi:  0.0341 },
  { year: 1973, sp500: -0.1466, tbill: 0.0718, tbond: -0.0111, cpi:  0.0880 },
  { year: 1974, sp500: -0.2647, tbill: 0.0796, tbond:  0.0435, cpi:  0.1220 },
  { year: 1975, sp500:  0.3720, tbill: 0.0580, tbond:  0.0919, cpi:  0.0694 },
  { year: 1976, sp500:  0.2384, tbill: 0.0508, tbond:  0.1675, cpi:  0.0486 },
  { year: 1977, sp500: -0.0718, tbill: 0.0513, tbond: -0.0067, cpi:  0.0670 },
  { year: 1978, sp500:  0.0656, tbill: 0.0718, tbond: -0.0116, cpi:  0.0902 },
  { year: 1979, sp500:  0.1844, tbill: 0.1038, tbond: -0.0122, cpi:  0.1329 },
  { year: 1980, sp500:  0.3242, tbill: 0.1153, tbond: -0.0395, cpi:  0.1252 },
  { year: 1981, sp500: -0.0491, tbill: 0.1486, tbond:  0.0185, cpi:  0.0891 },
  { year: 1982, sp500:  0.2141, tbill: 0.1080, tbond:  0.4020, cpi:  0.0383 },
  { year: 1983, sp500:  0.2251, tbill: 0.0877, tbond:  0.0065, cpi:  0.0379 },
  { year: 1984, sp500:  0.0627, tbill: 0.0951, tbond:  0.1543, cpi:  0.0395 },
  { year: 1985, sp500:  0.3216, tbill: 0.0774, tbond:  0.3097, cpi:  0.0362 },
  { year: 1986, sp500:  0.1847, tbill: 0.0607, tbond:  0.2448, cpi:  0.0191 },
  { year: 1987, sp500:  0.0523, tbill: 0.0575, tbond: -0.0294, cpi:  0.0366 },
  { year: 1988, sp500:  0.1681, tbill: 0.0672, tbond:  0.0954, cpi:  0.0414 },
  { year: 1989, sp500:  0.3149, tbill: 0.0843, tbond:  0.1765, cpi:  0.0483 },
  { year: 1990, sp500: -0.0317, tbill: 0.0781, tbond:  0.0615, cpi:  0.0539 },
  { year: 1991, sp500:  0.3055, tbill: 0.0559, tbond:  0.1930, cpi:  0.0306 },
  { year: 1992, sp500:  0.0767, tbill: 0.0351, tbond:  0.0952, cpi:  0.0290 },
  { year: 1993, sp500:  0.0999, tbill: 0.0297, tbond:  0.1824, cpi:  0.0274 },
  { year: 1994, sp500:  0.0131, tbill: 0.0391, tbond: -0.0792, cpi:  0.0267 },
  { year: 1995, sp500:  0.3758, tbill: 0.0554, tbond:  0.2348, cpi:  0.0253 },
  { year: 1996, sp500:  0.2296, tbill: 0.0519, tbond:  0.0134, cpi:  0.0332 },
  { year: 1997, sp500:  0.3336, tbill: 0.0513, tbond:  0.1199, cpi:  0.0170 },
  { year: 1998, sp500:  0.2858, tbill: 0.0490, tbond:  0.1448, cpi:  0.0161 },
  { year: 1999, sp500:  0.2104, tbill: 0.0468, tbond: -0.0825, cpi:  0.0268 },
  { year: 2000, sp500: -0.0910, tbill: 0.0598, tbond:  0.1666, cpi:  0.0338 },
  { year: 2001, sp500: -0.1189, tbill: 0.0343, tbond:  0.0557, cpi:  0.0283 },
  { year: 2002, sp500: -0.2210, tbill: 0.0161, tbond:  0.1512, cpi:  0.0159 },
  { year: 2003, sp500:  0.2868, tbill: 0.0094, tbond:  0.0138, cpi:  0.0227 },
  { year: 2004, sp500:  0.1088, tbill: 0.0144, tbond:  0.0849, cpi:  0.0268 },
  { year: 2005, sp500:  0.0491, tbill: 0.0316, tbond:  0.0287, cpi:  0.0339 },
  { year: 2006, sp500:  0.1579, tbill: 0.0466, tbond:  0.0196, cpi:  0.0323 },
  { year: 2007, sp500:  0.0549, tbill: 0.0448, tbond:  0.1021, cpi:  0.0285 },
  { year: 2008, sp500: -0.3700, tbill: 0.0161, tbond:  0.2598, cpi:  0.0385 },
  { year: 2009, sp500:  0.2646, tbill: 0.0015, tbond: -0.1112, cpi: -0.0034 },
  { year: 2010, sp500:  0.1506, tbill: 0.0014, tbond:  0.0846, cpi:  0.0164 },
  { year: 2011, sp500:  0.0211, tbill: 0.0005, tbond:  0.1641, cpi:  0.0314 },
  { year: 2012, sp500:  0.1600, tbill: 0.0007, tbond:  0.0297, cpi:  0.0208 },
  { year: 2013, sp500:  0.3239, tbill: 0.0005, tbond: -0.0910, cpi:  0.0146 },
  { year: 2014, sp500:  0.1369, tbill: 0.0003, tbond:  0.1075, cpi:  0.0076 },
  { year: 2015, sp500:  0.0138, tbill: 0.0005, tbond:  0.0127, cpi:  0.0073 },
  { year: 2016, sp500:  0.1196, tbill: 0.0021, tbond:  0.0069, cpi:  0.0210 },
  { year: 2017, sp500:  0.2183, tbill: 0.0086, tbond:  0.0280, cpi:  0.0210 },
  { year: 2018, sp500: -0.0438, tbill: 0.0191, tbond: -0.0002, cpi:  0.0244 },
  { year: 2019, sp500:  0.3149, tbill: 0.0235, tbond:  0.0925, cpi:  0.0181 },
  { year: 2020, sp500:  0.1840, tbill: 0.0036, tbond:  0.1099, cpi:  0.0123 },
  { year: 2021, sp500:  0.2871, tbill: 0.0005, tbond: -0.0426, cpi:  0.0470 },
  { year: 2022, sp500: -0.1811, tbill: 0.0201, tbond: -0.1769, cpi:  0.0800 },
  { year: 2023, sp500:  0.2629, tbill: 0.0524, tbond:  0.0401, cpi:  0.0419 },
  { year: 2024, sp500:  0.2502, tbill: 0.0532, tbond:  0.0241, cpi:  0.0289 },
];

/** Compute real return from nominal return and inflation */
export function realReturn(nominal: number, inflation: number): number {
  return (1 + nominal) / (1 + inflation) - 1;
}

/** Real returns derived from nominal returns and CPI */
export const realReturns = historicalReturns.map(d => ({
  year: d.year,
  sp500Real: realReturn(d.sp500, d.cpi),
  tbillReal: realReturn(d.tbill, d.cpi),
  tbondReal: realReturn(d.tbond, d.cpi),
}));
