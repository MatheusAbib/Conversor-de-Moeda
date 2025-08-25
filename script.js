 const API_BASE = "https://api.frankfurter.app";
    const baseSel = document.getElementById("base");
    const targetSel = document.getElementById("target");
    const amountInp = document.getElementById("amount");
    const rateCard = document.getElementById("rateCard");
    const updateCard = document.getElementById("updateCard");
    const resultCard = document.querySelector("#resultCard .card-value");
    const errorBox = document.getElementById("error");
    const autoRefreshChk = document.getElementById("autoRefresh");
    const intervalSel = document.getElementById("interval");
    
    let base = "USD";
    let target = "BRL";
    let rate = null;
    let timer;
    let lastUpdate = null;

    async function loadCurrencies() {
      try {
        const res = await fetch(`${API_BASE}/currencies`);
        const data = await res.json();
        fillSelect(baseSel, data, base);
        fillSelect(targetSel, data, target);
      } catch {
        errorBox.textContent = "Erro ao carregar moedas";
      }
    }

    function fillSelect(select, data, selected) {
      select.innerHTML = "";
      Object.keys(data).sort().forEach(code => {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = `${code} — ${data[code]}`;
        if (code === selected) opt.selected = true;
        select.appendChild(opt);
      });
    }

    async function fetchRate() {
      errorBox.textContent = "";
      if (base === target) {
        rate = 1;
        updateUI();
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/latest?from=${base}&to=${target}`);
        const data = await res.json();
        rate = data.rates[target];
        lastUpdate = new Date();
        updateUI(data.date);
      } catch {
        errorBox.textContent = "Erro ao buscar cotação";
      }
    }

    function updateUI(dateStr) {
      rateCard.textContent = `1 ${base} = ${rate.toFixed(4)} ${target}`;
      updateCard.textContent = dateStr || lastUpdate.toLocaleString();
      const amount = parseFloat(amountInp.value) || 0;
      resultCard.textContent = `${(amount * rate).toFixed(2)} ${target}`;
    }

    function startAutoRefresh() {
      clearInterval(timer);
      if (autoRefreshChk.checked) {
        timer = setInterval(fetchRate, parseInt(intervalSel.value));
      }
    }

    document.getElementById("swap").onclick = () => {
      [base, target] = [target, base];
      baseSel.value = base;
      targetSel.value = target;
      fetchRate();
    };

    baseSel.onchange = () => { base = baseSel.value; fetchRate(); };
    targetSel.onchange = () => { target = targetSel.value; fetchRate(); };
    amountInp.oninput = () => updateUI();
    document.getElementById("refresh").onclick = fetchRate;
    autoRefreshChk.onchange = startAutoRefresh;
    intervalSel.onchange = startAutoRefresh;

    loadCurrencies().then(fetchRate).then(startAutoRefresh);