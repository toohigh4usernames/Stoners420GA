// --------- FREE "Drops" data (edit this anytime) ---------
const DROPS = [
  {
    id: "drop-001",
    name: "Latest Drop #1",
    price: "$25",
    tag: "New",
    desc: "Put your product details here.",
    buyUrl: "" // optional: paste a Stripe Payment Link or checkout link
  },
  {
    id: "drop-002",
    name: "Latest Drop #2",
    price: "$40",
    tag: "Limited",
    desc: "Short description, flavors/strain/etc.",
    buyUrl: ""
  }
];

// --------- Simple router (tabs) ----------
const views = ["home","shop","messages","about"];
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.dataset.view;
    views.forEach(v=>{
      document.getElementById(`view-${v}`).classList.toggle("hidden", v!==view);
    });
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

// --------- Render Drops ----------
const dropsGrid = document.getElementById("dropsGrid");
const shopList = document.getElementById("shopList");

function renderDrops(list){
  dropsGrid.innerHTML = "";
  list.slice(0,6).forEach(d=>{
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="name">${escapeHtml(d.name)}</div>
      <div class="price">${escapeHtml(d.price)}</div>
      <div class="badge">${escapeHtml(d.tag || "Drop")}</div>
    `;
    el.addEventListener("click", ()=>openDrop(d));
    dropsGrid.appendChild(el);
  });
}

function renderShop(list){
  shopList.innerHTML = "";
  list.forEach(d=>{
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="row">
        <div>
          <div class="name">${escapeHtml(d.name)}</div>
          <div class="price">${escapeHtml(d.price)} • <span class="muted">${escapeHtml(d.tag || "")}</span></div>
        </div>
        <button class="btn ghost" type="button">View</button>
      </div>
    `;
    el.querySelector("button").addEventListener("click", ()=>openDrop(d));
    shopList.appendChild(el);
  });
}

function openDrop(d){
  const hasBuy = (d.buyUrl || "").trim().length > 0;
  const msg = [
    `${d.name}`,
    `${d.price}`,
    ``,
    `${d.desc || ""}`,
    ``,
    hasBuy ? `Buy link: ${d.buyUrl}` : `No buy link set yet. Message to order.`
  ].join("\n");

  // Quick product modal using native confirm-like flow
  const goBuy = hasBuy ? confirm(`${msg}\n\nOpen buy link?`) : false;
  if (goBuy) window.open(d.buyUrl, "_blank");
  else {
    // switch to Messages tab for ordering
    document.querySelector('.tab[data-view="messages"]').click();
    document.getElementById("msgText").value =
      `I want: ${d.name}\nQuantity:\nNotes:`;
    document.getElementById("msgText").focus();
  }
}

renderDrops(DROPS);
renderShop(DROPS);

// Search
document.getElementById("search").addEventListener("input", (e)=>{
  const q = e.target.value.toLowerCase().trim();
  const filtered = DROPS.filter(d =>
    (d.name||"").toLowerCase().includes(q) ||
    (d.tag||"").toLowerCase().includes(q) ||
    (d.desc||"").toLowerCase().includes(q)
  );
  renderShop(filtered);
});

// --------- Messaging (we’ll connect Firebase next) ----------
const form = document.getElementById("msgForm");
const statusEl = document.getElementById("msgStatus");

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  statusEl.textContent = "Sending…";

  const payload = {
    name: document.getElementById("msgName").value.trim(),
    contact: document.getElementById("msgContact").value.trim(),
    text: document.getElementById("msgText").value.trim(),
    createdAt: new Date().toISOString(),
    ua: navigator.userAgent
  };

  try{
    // Placeholder: Firebase write will go here in Step 4
    // For now, store locally so you can test the flow:
    const inbox = JSON.parse(localStorage.getItem("s420_inbox") || "[]");
    inbox.unshift(payload);
    localStorage.setItem("s420_inbox", JSON.stringify(inbox));

    statusEl.textContent = "Sent! (Local test mode) — next we connect free Firebase so YOU receive it.";
    form.reset();
  }catch(err){
    statusEl.textContent = "Could not send. Try again.";
  }
});

// --------- Install button ----------
let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

// util
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}
