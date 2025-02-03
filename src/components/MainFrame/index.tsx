import { useCallback, useEffect, useState } from "react";
import styles from './styles.module.scss';
import { gsap } from "gsap";
import SDK from '@uphold/uphold-sdk-javascript';
import CustomSelect from "../Input/Select";

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH', 'XRP', 'BCH', 'LTC', 'ADA'];
type Rates = { [key: string]: string };
type Cache = { [key: string]: Rates };

const sdk = new SDK({
    baseUrl: 'http://api-sandbox.uphold.com',
    clientId: 'foo',
    clientSecret: 'bar'
});


const CurrencyPill = ({currency, currencySymbol}) => {
    function getImageUrl(name) {
        // note that this does not include files in subdirectories
        return new URL(`../../assets/currencies/${name}.png`, import.meta.url).href
      }
    return (
        <div className={styles.currencyPill}>
            <img src={getImageUrl(currencySymbol)}/>
            <p>{currency}</p>
        </div>
    )
}

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

                <CustomSelect options={CURRENCIES} selectedValue={baseCurrency} onChange={setBaseCurrency}/>
            </div>

            <div className={styles.ratesContainer} data-testid="rates-container">
                {!rates && <span>Enter an amount to check the rates.</span>}
                {Object.entries(rates).map(([currency, rate]) => (
                    <div key={currency} className={styles.rateItem}>
                        <span className={styles.rateValue}>{rate}</span>
                        <CurrencyPill currency={currency} currencySymbol={currency}/>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default MainFrame;