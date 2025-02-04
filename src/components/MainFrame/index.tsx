import { useCallback, useEffect, useRef, useState } from "react";
import styles from './styles.module.scss';
import { gsap } from "gsap";
import SDK from '@uphold/uphold-sdk-javascript';
import CustomSelect from "../Input/Select";

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH', 'XRP', 'BCH', 'LTC', 'ADA'];
type Rates = { [key: string]: string };
type Cache = { [key: string]: Rates };
type RatesCache = { [pair: string]: number };

const sdk = new SDK({
    baseUrl: 'http://api-sandbox.uphold.com',
    clientId: 'foo',
    clientSecret: 'bar'
});


const CurrencyPill = ({ currency, currencySymbol }) => {
    function getImageUrl(name) {
        // note that this does not include files in subdirectories
        return new URL(`../../assets/currencies/${name}.png`, import.meta.url).href
    }
    return (
        <div className={styles.currencyPill}>
            <img src={getImageUrl(currencySymbol)} />
            <p>{currency}</p>
        </div>
    )
}

const MainFrame = (): React.JSX.Element => {
    const [amount, setAmount] = useState<string>('1.00');
    const [baseCurrency, setBaseCurrency] = useState<string>('USD');
    const [rates, setRates] = useState<Rates>({});
    const [convertedAmounts, setConvertedAmounts] = useState<Rates>({});
    const [ratesCache, setRatesCache] = useState<RatesCache>({});
    const debounceRef = useRef<NodeJS.Timeout>();


    const fetchRates = useCallback(async (currency: string) => {
        const newRates: RatesCache = {};

        await Promise.all(
            CURRENCIES
                .filter(c => c !== currency)
                .map(async (target) => {
                    const pair = `${currency}-${target}`;
                    if (ratesCache[pair]) return; // Use cached rate if available

                    try {
                        const ticker = await sdk.getTicker(pair);
                        newRates[pair] = ticker.ask;
                    } catch (error) {
                        console.error(`Error fetching ${pair}:`, error);
                        newRates[pair] = 0;
                    }
                })
        );

        setRatesCache(prev => ({ ...prev, ...newRates }));
    }, [ratesCache]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchRates(baseCurrency);
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [baseCurrency, fetchRates]);

    useEffect(() => {
        const numericAmount = parseFloat(amount) || 0;
        const newAmounts: Rates = {};

        CURRENCIES
            .filter(c => c !== baseCurrency)
            .forEach(target => {
                const pair = `${baseCurrency}-${target}`;
                const rate = ratesCache[pair] || 0;
                newAmounts[target] = (numericAmount * rate).toFixed(4);
            });

        setConvertedAmounts(newAmounts);
    }, [amount, baseCurrency, ratesCache]);

    useEffect(() => {
        gsap.from(`.${styles.rateItem}`, {
            y: 10,
            opacity: 0,
            stagger: 0.1,
            duration: 0.3
        });
    }, [baseCurrency]);


    console.log({ rates, amount, baseCurrency })
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
                    onFocus={(e) => gsap.to(e.target, { scale: 1.02, duration: 0.3 })}
                    onBlur={(e) => gsap.to(e.target, { scale: 1, duration: 0.3 })}
                />

                <CustomSelect options={CURRENCIES} selectedValue={baseCurrency} onChange={setBaseCurrency} />
            </div>

            <div className={styles.ratesContainer} data-testid="rates-container">
                {!rates && <span>Enter an amount to check the rates.</span>}
                {Object.entries(convertedAmounts).map(([currency, amount]) => (
                    <div key={currency} className={styles.rateItem}>
                        <span className={styles.rateValue}>{amount}</span>
                        <CurrencyPill currency={currency} currencySymbol={currency} />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default MainFrame;