// oklch to rgb string conversion for html2canvas compatibility

function oklchToRgbVal(l, c, h, alpha) {
    const hRad = (h * Math.PI) / 180;
    const aComp = c * Math.cos(hRad);
    const bComp = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * aComp + 0.2158037573 * bComp;
    const m_ = l - 0.1055613458 * aComp - 0.0638541728 * bComp;
    const s_ = l - 0.0894841775 * aComp - 1.291485548 * bComp;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rL = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gL = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bL = -0.0041960863 * l3 - 0.703418614 * m3 + 1.707614701 * s3;

    const f = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

    const r = Math.max(0, Math.min(255, Math.round(f(rL) * 255)));
    const g = Math.max(0, Math.min(255, Math.round(f(gL) * 255)));
    const b = Math.max(0, Math.min(255, Math.round(f(bL) * 255)));

    if (alpha !== undefined && alpha !== null && !isNaN(alpha)) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
}

export function convertOklchToRgbInString(str) {
    if (!str || typeof str !== 'string' || !str.includes('oklch(')) return str;

    return str.replace(/oklch\(([^)]+)\)/g, (match, inner) => {
        try {
            const [colorPart, alphaPart] = inner.split('/');
            const colorTokens = colorPart.trim().split(/\s+/);
            if (colorTokens.length < 3) return match;

            let lValue = parseFloat(colorTokens[0]);
            if (colorTokens[0].endsWith('%')) {
                lValue = parseFloat(colorTokens[0]) / 100;
            }

            let cValue = parseFloat(colorTokens[1]);
            if (colorTokens[1].endsWith('%')) {
                cValue = (parseFloat(colorTokens[1]) / 100) * 0.4;
            }

            let hValue = parseFloat(colorTokens[2]);
            if (colorTokens[2] === 'none' || isNaN(hValue)) {
                hValue = 0;
            }

            let aValue = alphaPart ? parseFloat(alphaPart.trim()) : undefined;
            if (alphaPart && alphaPart.trim().endsWith('%')) {
                aValue = parseFloat(alphaPart.trim()) / 100;
            }

            return oklchToRgbVal(lValue, cValue, hValue, aValue);
        } catch (e) {
            console.error("oklch convert error:", e);
            return match;
        }
    });
}

export function patchOklchForHtml2pdf() {
    if (typeof window === 'undefined') return () => {};

    const originalRules = [];
    
    // 1. Convert StyleSheets
    for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
            if (!sheet.cssRules) continue;
            
            const processRules = (rules) => {
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.type === CSSRule.STYLE_RULE && rule.style) {
                        const style = rule.style;
                        for (let k = 0; k < style.length; k++) {
                            const propName = style[k];
                            const propVal = style.getPropertyValue(propName);
                            if (propVal && propVal.includes('oklch(')) {
                                const newVal = convertOklchToRgbInString(propVal);
                                originalRules.push({ rule, propName, originalVal: propVal });
                                style.setProperty(propName, newVal);
                            }
                        }
                    } else if (rule.type === CSSRule.MEDIA_RULE && rule.cssRules) {
                        processRules(rule.cssRules);
                    } else if (rule.type === CSSRule.SUPPORTS_RULE && rule.cssRules) {
                        processRules(rule.cssRules);
                    }
                }
            };
            
            processRules(sheet.cssRules);
        } catch (e) {
            console.warn("Could not read stylesheet rules: ", sheet.href, e);
        }
    }

    const restoreStyleSheets = () => {
        for (const { rule, propName, originalVal } of originalRules) {
            try {
                rule.style.setProperty(propName, originalVal);
            } catch (e) {}
        }
    };

    // 2. Patch window.getComputedStyle
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function (el, pseudo) {
        const computed = originalGetComputedStyle.call(this, el, pseudo);
        if (!computed) return computed;
        
        return new Proxy(computed, {
            get(target, prop) {
                if (prop === 'getPropertyValue') {
                    return function (propertyName) {
                        const val = target.getPropertyValue(propertyName);
                        return convertOklchToRgbInString(val);
                    };
                }
                const val = target[prop];
                if (typeof val === 'string' && val.includes('oklch(')) {
                    return convertOklchToRgbInString(val);
                }
                return val;
            }
        });
    };

    // 3. Patch CSSStyleDeclaration.prototype.getPropertyValue
    const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
    CSSStyleDeclaration.prototype.getPropertyValue = function (propertyName) {
        const val = originalGetPropertyValue.call(this, propertyName);
        return convertOklchToRgbInString(val);
    };

    // 4. Return restore function
    return () => {
        try {
            restoreStyleSheets();
        } catch (e) {
            console.error("restoreStyleSheets error:", e);
        }
        window.getComputedStyle = originalGetComputedStyle;
        CSSStyleDeclaration.prototype.getPropertyValue = originalGetPropertyValue;
    };
}
