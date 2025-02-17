
export async function fetchBNBPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
    const data = await response.json();
    return data.binancecoin.usd;
  } catch (error) {
    console.error('Error fetching BNB price:', error);
    return 0;
  }
}
