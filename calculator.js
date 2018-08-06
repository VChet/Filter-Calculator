document.addEventListener("DOMContentLoaded", function () {
    const inputInitial = document.querySelector(".inputInitial");
    /* 	const selectorInitial = document.querySelector(".selectorInitial"); */
    const inputTarget = document.querySelector(".inputTarget");
    /* 	const selectorTarget = document.querySelector(".selectorTarget"); */

    const initialColor = document.querySelector(".initialColor");
    const initialData = initialColor.querySelectorAll("p");
    const targetColor = document.querySelector(".targetColor");
    const targetData = targetColor.querySelectorAll("p");
    /* const initialSepia = document.querySelector(".initialSepia"); */
    /* const sepiaData = initialSepia.querySelectorAll("p"); */
    const calculatedTarget = document.querySelector(".calculatedTarget");
    const filterString = document.querySelector(".filterString samp");
    const colorMatrixString = document.querySelector(".colorMatrixString samp");
    const colorMatrix = document.querySelector("feColorMatrix");

    inputInitial.addEventListener("input", calculate);
    inputTarget.addEventListener("input", calculate);

    function hexToRgb(hex) {
        if ((hex.length < 2) || (hex.length > 6)) { return false; }
        const values = hex.split("");
        let r, g, b;

        if (hex.length === 2) {
            r = parseInt(values[0].toString() + values[1].toString(), 16);
            g = r;
            b = r;
        } else if (hex.length === 3) {
            r = parseInt(values[0].toString() + values[0].toString(), 16);
            g = parseInt(values[1].toString() + values[1].toString(), 16);
            b = parseInt(values[2].toString() + values[2].toString(), 16);
        } else if (hex.length === 6) {
            r = parseInt(values[0].toString() + values[1].toString(), 16);
            g = parseInt(values[2].toString() + values[3].toString(), 16);
            b = parseInt(values[4].toString() + values[5].toString(), 16);
        } else {
            return false;
        }
        return [r, g, b];
    }
    console.assert(hexToRgb("B9B384").toString() == [185, 179, 132].toString(), "hexToRgb Failed");

    function rgbToHsv(r, g, b) {
        r /= 255, g /= 255, b /= 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        const d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [(h * 360), (s * 100), (v * 100)];
    }
    console.assert(rgbToHsv(185, 179, 132).map((a) => Math.floor(a)).toString() == ["53", "28", "72"].toString(), "rgbToHsv Failed");

    function sepiaEffect(r, g, b) {
        let result = [];
        result.push((r * 0.393) + (g * 0.769) + (b * 0.189));
        result.push((r * 0.349) + (g * 0.686) + (b * 0.168));
        result.push((r * 0.272) + (g * 0.534) + (b * 0.131));
        return result;
    }

    function findDiff(initial, target) {
        let result = [];
        result.push(
            target[0] - initial[0],
            100 + (initial[1] - target[1]),
            100 + (target[2] - initial[2])
        );
        return result.map((a) => a.toFixed(1));
    }

    function calculate() {
        inputInitial.value = inputInitial.value.toUpperCase();
        inputTarget.value = inputTarget.value.toUpperCase();

        // ==Initial==
        initialColor.style.backgroundColor = `#${inputInitial.value}`;
        initialData[0].innerText = `HEX ${inputInitial.value}`;
        const initialRGB = hexToRgb(inputInitial.value);
        initialData[1].innerText = `RGB ${initialRGB}`;
        if (initialRGB == false) { return; }
        initialData[2].innerText = `HSV ${rgbToHsv.apply(null, initialRGB).map((a) => Math.floor(a))}`;

        // ==Target==
        targetColor.style.backgroundColor = `#${inputTarget.value}`;
        targetData[0].innerText = `HEX ${inputTarget.value}`;
        targetData[1].innerText = `RGB ${hexToRgb(inputTarget.value)}`;
        let targetHSV = false;
        if (hexToRgb(inputTarget.value) == false) { return; }
        targetHSV = rgbToHsv.apply(null, hexToRgb(inputTarget.value)).map((a) => Math.floor(a));
        targetData[2].innerText = `HSV ${targetHSV}`;

        // ==Sepia Only==
        let sepiaRGB = sepiaEffect.apply(null, initialRGB);
        let sepiaHSV = rgbToHsv.apply(null, sepiaRGB);

        // ==Sepia and Brightness==
        sepiaHSV[2] *= 0.5;
        /* initialSepia.style.backgroundColor = `hsl(${sepiaHSV[0]},${sepiaHSV[1]}%,${sepiaHSV[2]}%)`; */
        /* sepiaData[2].innerText = `HSV ${sepiaHSV.map((a) => Math.floor(a))}`; */

        // ==Result with filters==
        if (targetHSV == false) { return; }
        const diff = targetHSV && findDiff(sepiaHSV, targetHSV);
        const cssLine = `brightness(50%) sepia(1) hue-rotate(${diff[0]}deg) saturate(${diff[1]}%) brightness(${diff[1]}%)`;
        filterString.innerText = `-webkit-filter: ${cssLine};\r\nfilter: ${cssLine}`
        calculatedTarget.style.filter = `${cssLine}`;

        // ==Result with Color Matrix==
        const sRGB = hexToRgb(inputTarget.value).map((a) => a / 256);
        colorMatrix.values.baseVal[4].value = sRGB[0];
        colorMatrix.values.baseVal[9].value = sRGB[1];
        colorMatrix.values.baseVal[14].value = sRGB[2];

        const svgBlock = document.querySelector("svg");
        colorMatrixString.innerText = svgBlock.outerHTML;
    }
}, false);