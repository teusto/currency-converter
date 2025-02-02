import { useCallback, useEffect, useState } from "react";
import styles from './styles.module.scss';
import { gsap } from "gsap";
import SDK from '@uphold/uphold-sdk-javascript';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH', 'XRP', 'BCH', 'LTC', 'ADA'];
type Rates = { [key: string]: string };
type Cache = { [key: string]: Rates };

const sdk = new SDK({
    baseUrl: 'http://api-sandbox.uphold.com',
    clientId: 'foo',
    clientSecret: 'bar'
});

const MainFrame = (): React.JSX.Element => {
    const [amount, setAmount] = useState<string>('1.00');
    const [baseCurrency, setBaseCurrency] = useState<string>('USD');
    const [rates, setRates] = useState<Rates>({});
    const [cache, setCache] = useState<Cache>({});

    const fetchRates = useCallback(async (currency: string) => {
        if (cache[currency]) {
            setRates(cache[currency]);
            return;
        }

        const newRates: Rates = {};
        const numericAmount = parseFloat(amount) || 0;

        await Promise.all(
            CURRENCIES
                .filter(c => c !== currency)
                .map(async (targetCurrency) => {
                    const pair = `${currency}-${targetCurrency}`;
                    try {
                        const ticker = await sdk.getTicker(pair);
                        newRates[targetCurrency] = (numericAmount * ticker.ask).toFixed(4);
                    } catch (error) {
                        console.error(`Error fetching rate for ${pair}:`, error);
                        newRates[targetCurrency] = 'N/A';
                    }
                })
        );

        setCache(prev => ({ ...prev, [currency]: newRates }));
        setRates(newRates);
    }, [amount, cache]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchRates(baseCurrency);
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [amount, baseCurrency, fetchRates]);

    useEffect(() => {
        gsap.from(`.${styles.rateItem}`, {
            y: 10,
            opacity: 0,
            stagger: 0.1,
            duration: 0.3
        });
    }, [rates]);

    return (
        <section className={styles.container}>
            <div className={styles.texts}>
                <h2>Currency Converter</h2>
                <p>Receive competitive and transparent pricing with no hidden spreads. See how we compare.</p>
            </div>
            <div className={styles.converter}>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={styles.amountInput}
                    data-testid="amount-input"
                    onFocus={(e) => gsap.to(e.target, { scale: 1.05, duration: 0.3 })}
                    onBlur={(e) => gsap.to(e.target, { scale: 1, duration: 0.3 })}
                />

                <select
                    value={baseCurrency}
                    className={styles.currencySelect}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    data-testid="currency-select"
                >
                    {CURRENCIES.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                    ))}
                </select>
            </div>

            <div className={styles.ratesContainer} data-testid="rates-container">
                <span>Enter an amount to check the rates.</span>
                {Object.entries(rates).map(([currency, rate]) => (
                    <div key={currency} className={styles.rateItem}>
                        <span className={styles.rateValue}>{rate}</span>
                        <span className={styles.currencyCode}>{currency}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default MainFrame;