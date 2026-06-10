// oklch and oklab to rgb string conversion for html2canvas compatibility

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

function oklabToRgbVal(l, aCoord, bCoord, alpha) {
    const l_ = l + 0.3963377774 * aCoord + 0.2158037573 * bCoord;
    const m_ = l - 0.1055613458 * aCoord - 0.0638541728 * bCoord;
    const s_ = l - 0.0894841775 * aCoord - 1.291485548 * bCoord;

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

export function convertOklabToRgbInString(str) {
    if (!str || typeof str !== 'string' || !str.includes('oklab(')) return str;

    return str.replace(/oklab\(([^)]+)\)/g, (match, inner) => {
        try {
            const [colorPart, alphaPart] = inner.split('/');
            const colorTokens = colorPart.trim().split(/\s+/);
            if (colorTokens.length < 3) return match;

            let lValue = parseFloat(colorTokens[0]);
            if (colorTokens[0].endsWith('%')) {
                lValue = parseFloat(colorTokens[0]) / 100;
            }

            let aValue = parseFloat(colorTokens[1]);
            if (colorTokens[1].endsWith('%')) {
                aValue = (parseFloat(colorTokens[1]) / 100) * 0.4;
            }

            let bValue = parseFloat(colorTokens[2]);
            if (colorTokens[2].endsWith('%')) {
                bValue = (parseFloat(colorTokens[2]) / 100) * 0.4;
            }

            let aValueAlpha = alphaPart ? parseFloat(alphaPart.trim()) : undefined;
            if (alphaPart && alphaPart.trim().endsWith('%')) {
                aValueAlpha = parseFloat(alphaPart.trim()) / 100;
            }

            return oklabToRgbVal(lValue, aValue, bValue, aValueAlpha);
        } catch (e) {
            console.error("oklab convert error:", e);
            return match;
        }
    });
}

export function convertColorsInString(str) {
    let result = str;
    if (result && typeof result === 'string') {
        if (result.includes('oklch(')) {
            result = convertOklchToRgbInString(result);
        }
        if (result.includes('oklab(')) {
            result = convertOklabToRgbInString(result);
        }
    }
    return result;
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
                            if (propVal && (propVal.includes('oklch(') || propVal.includes('oklab('))) {
                                const newVal = convertColorsInString(propVal);
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
            // Silence CORS security errors
        }
    }

    const restoreStyleSheets = () => {
        for (const { rule, propName, originalVal } of originalRules) {
            try {
                rule.style.setProperty(propName, originalVal);
            } catch (e) {}
        }
    };

    // 2. Patch window.getComputedStyle safely matching exact function call binding
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function (el, pseudo) {
        const computed = originalGetComputedStyle.call(this, el, pseudo);
        if (!computed) return computed;
        
        return new Proxy(computed, {
            get(target, prop) {
                const val = target[prop];
                if (typeof val === 'function') {
                    return function(...args) {
                        const res = val.apply(target, args);
                        if (typeof res === 'string' && (res.includes('oklch(') || res.includes('oklab('))) {
                            return convertColorsInString(res);
                        }
                        return res;
                    };
                }
                if (typeof val === 'string' && (val.includes('oklch(') || val.includes('oklab('))) {
                    return convertColorsInString(val);
                }
                return val;
            }
        });
    };

    // 3. Patch CSSStyleDeclaration.prototype.getPropertyValue
    const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
    CSSStyleDeclaration.prototype.getPropertyValue = function (propertyName) {
        const val = originalGetPropertyValue.call(this, propertyName);
        return convertColorsInString(val);
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

/**
 * Prepares an element and all of its descendants recursively for high-quality, 
 * light-theme print exports. It switches the app temporarily out of dark mode, 
 * expands all details elements, inlines critical color styles as clean web-safe RGB values, 
 * and restores everything cleanly on completion.
 */
export function prepareElementForPdfExport(element) {
    if (!element || typeof window === 'undefined') return () => {};

    // 0. Inject high-end PDF export styling class
    element.classList.add('pdf-export-mode');

    // 1. Force light mode temporarily if dark mode is active to capture light contrast colors
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
    }

    // 2. Open all <details> accordion elements so full contents print nicely
    const detailsToRestore = [];
    const details = element.querySelectorAll('details');
    details.forEach(d => {
        const wasOpen = d.hasAttribute('open');
        if (!wasOpen) {
            d.setAttribute('open', 'true');
            detailsToRestore.push({ d, wasOpen });
        }
    });

    // 3. Patch stylesheets & prototype methods for oklch + oklab -> RGB transparent translation
    const restoreGlobalColorsPatch = patchOklchForHtml2pdf();

    // 4. Force override of specific Tailwind v4 oklch/oklab colors on the elements to standard inlined RGB strings
    const originalStyles = new Map();
    const allEls = element.querySelectorAll('*');
    const elementsToProcess = [element, ...Array.from(allEls)];
    
    const colorProps = [
        'color', 
        'background-color', 
        'border-color', 
        'border-top-color', 
        'border-right-color', 
        'border-bottom-color', 
        'border-left-color',
        'fill',
        'stroke'
    ];

    elementsToProcess.forEach((el) => {
        const computed = window.getComputedStyle(el);
        if (!computed) return;
        
        const inlineToApply = {};
        const saved = {};
        
        // Convert colors
        colorProps.forEach(prop => {
            const val = computed.getPropertyValue(prop);
            if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('rgb') || val.includes('rgba') || val.includes('#'))) {
                saved[prop] = el.style.getPropertyValue(prop);
                const rgbVal = convertColorsInString(val);
                inlineToApply[prop] = rgbVal;
            }
        });

        // Clear shadows which render as pixelated dark black boxes in html2canvas
        const compShadow = computed.getPropertyValue('box-shadow');
        if (compShadow && compShadow !== 'none') {
            saved['box-shadow'] = el.style.getPropertyValue('box-shadow');
            el.style.setProperty('box-shadow', 'none', 'important');
        }

        const compTextShadow = computed.getPropertyValue('text-shadow');
        if (compTextShadow && compTextShadow !== 'none') {
            saved['text-shadow'] = el.style.getPropertyValue('text-shadow');
            el.style.setProperty('text-shadow', 'none', 'important');
        }
        
        originalStyles.set(el, saved);
        
        // Securely inject converted inline styles
        Object.entries(inlineToApply).forEach(([prop, val]) => {
            el.style.setProperty(prop, val, 'important');
        });
    });

    // 5. Instantly restore document's dark class so the user's interface remains dark without visual flicker
    if (isDark) {
        document.documentElement.classList.add('dark');
    }

    // Return the global final rollback function
    return () => {
        // Remove high-end PDF export styling class
        element.classList.remove('pdf-export-mode');

        // Toggle dark mode back if it was active
        if (isDark) {
            document.documentElement.classList.add('dark');
        }

        // Collapse previously closed <details> elements
        detailsToRestore.forEach(({ d, wasOpen }) => {
            if (!wasOpen) {
                d.removeAttribute('open');
            }
        });

        // Restore original inline style rules
        originalStyles.forEach((saved, el) => {
            Object.entries(saved).forEach(([prop, originalVal]) => {
                if (originalVal) {
                    el.style.setProperty(prop, originalVal);
                } else {
                    el.style.removeProperty(prop);
                }
            });
        });

        // Dereference window mutations
        restoreGlobalColorsPatch();
    };
}
