const PRODUCTS = [
  {
    id: 'p1',
    name: 'Amrut Sanjivani (Multi Berry Fuel)',
    tag: '500ml • Sugar Free • 92+ Natural Ingredients',
    price: 649,
    mrp: 799,
    desc: 'A unique Ayurvedic formula blended from over 92 natural berries and herbs. Sugar-free tonic crafted to boost energy and improve digestion for the whole family.',
    points: ['Boosts Energy', 'Improves Digestion', 'Sugar Free', '92+ Natural Ingredients'],
    img: '/images/amrut-sanjivani.jpg'
  },
  {
    id: 'p2',
    name: 'Soft Cozi Trifold Sanitary Napkins (Jumbo Pack)',
    tag: '40 Trifold Pads • Day/Night Protection',
    price: 299,
    mrp: 399,
    desc: '90% better absorption trifold sanitary napkins with anti-leak system and bigger wings. 100% toxic-free, rash & odor free, for day and night protection.',
    points: ['90% Better Absorption', 'Anti-Leak System', 'Rash & Odor Free', '100% Toxic Free'],
    img: '/images/soft-cozi.jpg'
  }
];

let appConfig = { upiId: 'yourshop@upi', upiName: 'Ayukripa Wellness Care' };

let state = {
  view: 'home',
  token: localStorage.getItem('ak_token') || null,
  customer: JSON.parse(localStorage.getItem('ak_customer') || 'null'),
  adminToken: sessionStorage.getItem('ak_admin_token') || null,
  cart: JSON.parse(localStorage.getItem('ak_cart') || '{}'),
  orders: [],
  allOrders: [],
  toast: null
};

function saveCartLocal(){ try{ localStorage.setItem('ak_cart', JSON.stringify(state.cart)); }catch(e){} }
function money(n){ return '₹' + Number(n).toLocaleString('en-IN'); }
function cartCount(){ return Object.values(state.cart).reduce((a,b)=>a+b,0); }
function cartTotal(){
  let t = 0;
  for(const [id, qty] of Object.entries(state.cart)){
    const p = PRODUCTS.find(x=>x.id===id);
    if(p) t += p.price * qty;
  }
  return t;
}
function go(view){ state.view = view; render(); window.scrollTo(0,0); }
function showToast(msg){ state.toast = msg; render(); setTimeout(()=>{ state.toast=null; render(); }, 2200); }

// ---------- API helper ----------
async function api(path, { method = 'GET', body, auth = 'customer' } = {}){
  const headers = { 'Content-Type': 'application/json' };
  const token = auth === 'admin' ? state.adminToken : state.token;
  if(token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch('/api' + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// ---------- Header ----------
function Header(){
  const count = cartCount();
  return `
  <div class="flex items-center justify-between py-4 flex-wrap gap-3">
    <div class="flex items-center gap-3 cursor-pointer" onclick="go('home')">
      <div class="w-11 h-11 rounded-full flex items-center justify-center text-white text-xl font-bold" style="background:var(--brand)">🌿</div>
      <div>
        <div class="text-xl font-bold" style="color:var(--brand)">Ayukripa <span style="color:var(--green)">Wellness Care</span></div>
        <div class="text-xs muted">Health is Priority</div>
      </div>
    </div>
    <div class="flex items-center gap-2 text-sm">
      <button onclick="go('shop')" class="px-3 py-2 rounded-lg hover:opacity-80">Shop</button>
      <button onclick="go('cart')" class="px-3 py-2 rounded-lg hover:opacity-80 relative">
        Cart ${count>0 ? `<span class="ml-1 badge text-xs px-2 py-0.5 rounded-full">${count}</span>` : ''}
      </button>
      ${state.customer ? `
        <button onclick="go('orders')" class="px-3 py-2 rounded-lg hover:opacity-80">My Orders</button>
        <span class="px-3 py-2 text-sm muted">Hi, ${state.customer.name.split(' ')[0]}</span>
        <button onclick="customerLogout()" class="px-3 py-2 rounded-lg brand-btn text-sm">Logout</button>
      ` : `
        <button onclick="go('customer-login')" class="px-3 py-2 rounded-lg brand-btn text-sm">Customer Login</button>
      `}
      ${state.adminToken ? `
        <button onclick="go('admin')" class="px-3 py-2 rounded-lg text-sm border line">Admin Panel</button>
        <button onclick="adminLogout()" class="px-3 py-2 rounded-lg text-sm border line">Admin Logout</button>
      ` : `
        <button onclick="go('admin-login')" class="px-3 py-2 rounded-lg text-sm border line">Admin</button>
      `}
    </div>
  </div>`;
}

// ---------- Home ----------
function Home(){
  return `
  <div class="rounded-2xl p-8 md:p-12 mb-8 card text-center">
    <div class="text-3xl md:text-4xl font-extrabold mb-3">Pure Ayurvedic Wellness, Delivered</div>
    <p class="muted max-w-2xl mx-auto mb-6">Shop our Ayurvedic tonics and personal care essentials. Fast checkout, secure payment, and order tracking every step of the way.</p>
    <button onclick="go('shop')" class="brand-btn px-6 py-3 rounded-xl font-semibold">Shop Now</button>
  </div>
  <div class="grid md:grid-cols-2 gap-6">
    ${PRODUCTS.map(p => ProductCard(p)).join('')}
  </div>
  <div class="grid sm:grid-cols-3 gap-4 mt-10 text-center">
    <div class="card rounded-xl p-5"><div class="text-2xl mb-1">🚚</div><div class="font-semibold">Fast Delivery</div><div class="text-sm muted">Across India</div></div>
    <div class="card rounded-xl p-5"><div class="text-2xl mb-1">🔒</div><div class="font-semibold">Secure Checkout</div><div class="text-sm muted">UPI &amp; COD</div></div>
    <div class="card rounded-xl p-5"><div class="text-2xl mb-1">🌿</div><div class="font-semibold">100% Natural</div><div class="text-sm muted">Ayurvedic ingredients</div></div>
  </div>`;
}

function ProductCard(p){
  return `
  <div class="card rounded-2xl overflow-hidden flex flex-col sm:flex-row cursor-pointer" onclick="go('product-${p.id}')">
    <img src="${p.img}" class="w-full sm:w-44 h-56 sm:h-auto object-cover" />
    <div class="p-5 flex flex-col flex-1">
      <div class="font-bold text-lg mb-1">${p.name}</div>
      <div class="text-xs muted mb-2">${p.tag}</div>
      <p class="text-sm muted mb-3 flex-1">${p.desc}</p>
      <div class="flex items-center gap-2 mb-3">
        <span class="font-bold text-lg" style="color:var(--brand)">${money(p.price)}</span>
        <span class="text-sm line-through muted">${money(p.mrp)}</span>
      </div>
      <button onclick="event.stopPropagation(); addToCart('${p.id}')" class="brand-btn px-4 py-2 rounded-lg text-sm font-semibold self-start">Add to Cart</button>
    </div>
  </div>`;
}

function ProductPage(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return `<div class="py-10">Product not found.</div>`;
  return `
  <button onclick="go('shop')" class="text-sm muted mb-4">&larr; Back to Shop</button>
  <div class="card rounded-2xl overflow-hidden grid md:grid-cols-2 gap-0">
    <img src="${p.img}" class="w-full h-full object-cover max-h-[520px]" />
    <div class="p-6 md:p-8">
      <div class="text-2xl font-bold mb-2">${p.name}</div>
      <div class="text-sm muted mb-4">${p.tag}</div>
      <div class="flex items-center gap-2 mb-4">
        <span class="font-bold text-2xl" style="color:var(--brand)">${money(p.price)}</span>
        <span class="text-base line-through muted">${money(p.mrp)}</span>
      </div>
      <p class="muted mb-4">${p.desc}</p>
      <div class="flex flex-wrap gap-2 mb-6">
        ${p.points.map(pt => `<span class="text-xs px-3 py-1 rounded-full badge">${pt}</span>`).join('')}
      </div>
      <button onclick="addToCart('${p.id}')" class="brand-btn px-6 py-3 rounded-xl font-semibold">Add to Cart</button>
    </div>
  </div>`;
}

function Shop(){
  return `
  <div class="text-2xl font-bold my-6">Shop All Products</div>
  <div class="grid md:grid-cols-2 gap-6">${PRODUCTS.map(p=>ProductCard(p)).join('')}</div>`;
}

// ---------- Cart ----------
function addToCart(id){
  state.cart[id] = (state.cart[id]||0) + 1;
  saveCartLocal();
  showToast('Added to cart');
}
function setQty(id, qty){
  qty = parseInt(qty)||0;
  if(qty<=0) delete state.cart[id]; else state.cart[id]=qty;
  saveCartLocal();
  render();
}
function removeFromCart(id){ delete state.cart[id]; saveCartLocal(); render(); }

function Cart(){
  const items = Object.entries(state.cart);
  if(items.length===0){
    return `<div class="text-2xl font-bold my-6">Your Cart</div><div class="card rounded-xl p-10 text-center muted">Your cart is empty. <button onclick="go('shop')" class="underline" style="color:var(--brand)">Browse products</button></div>`;
  }
  const rows = items.map(([id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return `
    <div class="flex items-center gap-4 py-4 border-b line">
      <img src="${p.img}" class="w-16 h-16 object-cover rounded-lg"/>
      <div class="flex-1">
        <div class="font-semibold">${p.name}</div>
        <div class="text-sm muted">${money(p.price)} each</div>
      </div>
      <input type="number" min="1" value="${qty}" onchange="setQty('${id}', this.value)" class="w-16 border line rounded-lg px-2 py-1 text-center"/>
      <div class="font-semibold w-20 text-right">${money(p.price*qty)}</div>
      <button onclick="removeFromCart('${id}')" class="text-sm text-red-500">Remove</button>
    </div>`;
  }).join('');
  return `
  <div class="text-2xl font-bold my-6">Your Cart</div>
  <div class="card rounded-xl p-5">
    ${rows}
    <div class="flex justify-between items-center pt-4 text-lg font-bold">
      <span>Total</span><span style="color:var(--brand)">${money(cartTotal())}</span>
    </div>
    <button onclick="${state.customer ? "go('checkout')" : "go('customer-login')"}" class="brand-btn w-full mt-4 py-3 rounded-xl font-semibold">
      ${state.customer ? 'Proceed to Checkout' : 'Login to Checkout'}
    </button>
  </div>`;
}

// ---------- Customer Auth ----------
function CustomerLogin(){
  return `
  <div class="max-w-md mx-auto card rounded-2xl p-8 mt-10">
    <div class="text-xl font-bold mb-1">Customer Login</div>
    <div class="text-sm muted mb-6">Login to place and track your orders.</div>
    <div id="login-error" class="text-sm text-red-500 mb-3 hidden"></div>
    <input id="login-username" placeholder="Username" class="w-full border line rounded-lg px-3 py-2 mb-3"/>
    <input id="login-password" type="password" placeholder="Password" class="w-full border line rounded-lg px-3 py-2 mb-4"/>
    <button onclick="doCustomerLogin()" class="brand-btn w-full py-3 rounded-xl font-semibold mb-3">Login</button>
    <div class="text-sm text-center muted">New here? <button onclick="go('customer-signup')" class="underline" style="color:var(--brand)">Create an account</button></div>
  </div>`;
}

function CustomerSignup(){
  return `
  <div class="max-w-md mx-auto card rounded-2xl p-8 mt-10">
    <div class="text-xl font-bold mb-1">Create Account</div>
    <div class="text-sm muted mb-6">Just a few details to get started.</div>
    <div id="signup-error" class="text-sm text-red-500 mb-3 hidden"></div>
    <input id="su-name" placeholder="Full Name" class="w-full border line rounded-lg px-3 py-2 mb-3"/>
    <input id="su-username" placeholder="Choose a Username" class="w-full border line rounded-lg px-3 py-2 mb-3"/>
    <input id="su-email" type="email" placeholder="Email" class="w-full border line rounded-lg px-3 py-2 mb-3"/>
    <input id="su-phone" placeholder="Phone Number" class="w-full border line rounded-lg px-3 py-2 mb-3"/>
    <textarea id="su-address" placeholder="Delivery Address" class="w-full border line rounded-lg px-3 py-2 mb-3" rows="2"></textarea>
    <input id="su-password" type="password" placeholder="Password (min 6 characters)" class="w-full border line rounded-lg px-3 py-2 mb-4"/>
    <button onclick="doCustomerSignup()" class="brand-btn w-full py-3 rounded-xl font-semibold mb-3">Sign Up</button>
    <div class="text-sm text-center muted">Already have an account? <button onclick="go('customer-login')" class="underline" style="color:var(--brand)">Login</button></div>
  </div>`;
}

async function doCustomerSignup(){
  const name = document.getElementById('su-name').value.trim();
  const username = document.getElementById('su-username').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const phone = document.getElementById('su-phone').value.trim();
  const address = document.getElementById('su-address').value.trim();
  const password = document.getElementById('su-password').value;
  const err = document.getElementById('signup-error');
  if(!name||!username||!email||!phone||!address||!password){
    err.textContent = 'Please fill in all fields.'; err.classList.remove('hidden'); return;
  }
  try{
    const data = await api('/auth/signup', { method:'POST', body:{ name, username, email, phone, address, password } });
    state.token = data.token;
    state.customer = data.customer;
    localStorage.setItem('ak_token', data.token);
    localStorage.setItem('ak_customer', JSON.stringify(data.customer));
    showToast('Account created!');
    go('shop');
  }catch(e){
    err.textContent = e.message; err.classList.remove('hidden');
  }
}

async function doCustomerLogin(){
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  try{
    const data = await api('/auth/login', { method:'POST', body:{ username, password } });
    state.token = data.token;
    state.customer = data.customer;
    localStorage.setItem('ak_token', data.token);
    localStorage.setItem('ak_customer', JSON.stringify(data.customer));
    showToast('Welcome back, '+data.customer.name.split(' ')[0]+'!');
    go('shop');
  }catch(e){
    err.textContent = e.message; err.classList.remove('hidden');
  }
}

function customerLogout(){
  state.token = null; state.customer = null;
  localStorage.removeItem('ak_token'); localStorage.removeItem('ak_customer');
  go('home');
}

// ---------- Admin Auth ----------
function AdminLogin(){
  return `
  <div class="max-w-md mx-auto card rounded-2xl p-8 mt-10">
    <div class="text-xl font-bold mb-1">Admin Login</div>
    <div class="text-sm muted mb-6">For store staff to track and manage orders.</div>
    <div id="admin-error" class="text-sm text-red-500 mb-3 hidden"></div>
    <input id="admin-username" placeholder="Admin Username" class="w-full border line rounded-lg px-3 py-2 mb-3"/>
    <input id="admin-password" type="password" placeholder="Admin Password" class="w-full border line rounded-lg px-3 py-2 mb-4"/>
    <button onclick="doAdminLogin()" class="brand-btn w-full py-3 rounded-xl font-semibold mb-2">Login</button>
    <div class="text-xs muted text-center">Credentials are set on the server via environment variables (see .env).</div>
  </div>`;
}

async function doAdminLogin(){
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;
  const err = document.getElementById('admin-error');
  try{
    const data = await api('/auth/admin-login', { method:'POST', body:{ username, password } });
    state.adminToken = data.token;
    sessionStorage.setItem('ak_admin_token', data.token);
    await loadAllOrders();
    go('admin');
  }catch(e){
    err.textContent = e.message; err.classList.remove('hidden');
  }
}
function adminLogout(){ state.adminToken=null; sessionStorage.removeItem('ak_admin_token'); go('home'); }

// ---------- Checkout / Payment ----------
let checkoutMethod = 'upi';
function Checkout(){
  if(!state.customer) { return CustomerLogin(); }
  const total = cartTotal();
  if(total<=0){ return `<div class="py-10 text-center muted">Your cart is empty.</div>`; }
  const c = state.customer;
  return `
  <div class="text-2xl font-bold my-6">Checkout</div>
  <div class="grid md:grid-cols-2 gap-6">
    <div class="card rounded-xl p-5">
      <div class="font-bold mb-3">Delivery Details</div>
      <input id="co-name" value="${c.name}" placeholder="Full Name" class="w-full border line rounded-lg px-3 py-2 mb-3"/>
      <input id="co-phone" value="${c.phone}" placeholder="Phone" class="w-full border line rounded-lg px-3 py-2 mb-3"/>
      <textarea id="co-address" placeholder="Delivery Address" rows="3" class="w-full border line rounded-lg px-3 py-2 mb-3">${c.address}</textarea>
      <div class="font-bold mt-4 mb-2">Order Summary</div>
      ${Object.entries(state.cart).map(([id,qty])=>{
        const p = PRODUCTS.find(x=>x.id===id);
        return `<div class="flex justify-between text-sm py-1"><span>${p.name} x${qty}</span><span>${money(p.price*qty)}</span></div>`;
      }).join('')}
      <div class="flex justify-between font-bold pt-2 border-t line mt-2"><span>Total</span><span style="color:var(--brand)">${money(total)}</span></div>
    </div>
    <div class="card rounded-xl p-5">
      <div class="font-bold mb-3">Payment Method</div>
      <div class="flex gap-2 mb-4">
        <button onclick="setPayMethod('upi')" class="flex-1 py-2 rounded-lg border line ${checkoutMethod==='upi'?'brand-btn':''}">Scan &amp; Pay (UPI)</button>
        <button onclick="setPayMethod('cod')" class="flex-1 py-2 rounded-lg border line ${checkoutMethod==='cod'?'brand-btn':''}">Cash on Delivery</button>
      </div>
      <div id="pay-area"></div>
      <div id="checkout-error" class="text-sm text-red-500 mt-3 hidden"></div>
      <button onclick="placeOrder()" class="brand-btn w-full py-3 rounded-xl font-semibold mt-4">
        ${checkoutMethod==='upi' ? "I've Completed Payment — Place Order" : 'Place Order (Pay on Delivery)'}
      </button>
    </div>
  </div>`;
}

function setPayMethod(m){ checkoutMethod = m; render(); }

function renderPayArea(){
  const area = document.getElementById('pay-area');
  if(!area) return;
  const total = cartTotal();
  if(checkoutMethod === 'upi'){
    area.innerHTML = `
      <div class="text-center">
        <div id="qrcode" class="flex justify-center mb-3"></div>
        <div class="text-sm muted mb-1">Scan with any UPI app</div>
        <div class="font-bold" style="color:var(--brand)">${money(total)}</div>
        <div class="text-xs muted mt-2">Pay to: ${appConfig.upiId} (${appConfig.upiName})</div>
      </div>`;
    const qrDiv = document.getElementById('qrcode');
    if(qrDiv && window.QRCode){
      qrDiv.innerHTML = '';
      const upiUri = `upi://pay?pa=${encodeURIComponent(appConfig.upiId)}&pn=${encodeURIComponent(appConfig.upiName)}&am=${total}&cu=INR&tn=Order%20Payment`;
      new QRCode(qrDiv, { text: upiUri, width: 180, height: 180 });
    }
  } else {
    area.innerHTML = `<div class="text-sm muted p-3 rounded-lg" style="background:rgba(0,0,0,0.03)">Pay in cash when your order is delivered. Please keep exact change ready.</div>`;
  }
}

async function placeOrder(){
  const name = document.getElementById('co-name').value.trim();
  const phone = document.getElementById('co-phone').value.trim();
  const address = document.getElementById('co-address').value.trim();
  const err = document.getElementById('checkout-error');
  if(!name || !phone || !address){
    err.textContent = 'Please fill in your delivery details.'; err.classList.remove('hidden'); return;
  }
  const items = Object.entries(state.cart).map(([id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return { id, name: p.name, price: p.price, qty };
  });
  const total = cartTotal();
  try{
    await api('/orders', {
      method: 'POST',
      body: {
        customerName: name, phone, address, items, total,
        paymentMethod: checkoutMethod === 'upi' ? 'UPI (self-reported)' : 'Cash on Delivery'
      }
    });
    state.cart = {};
    saveCartLocal();
    showToast('Order placed successfully!');
    go('orders');
  }catch(e){
    err.textContent = e.message; err.classList.remove('hidden');
  }
}

// ---------- Customer Orders ----------
async function loadMyOrders(){
  if(!state.customer) return;
  try{
    state.orders = await api('/orders/mine');
    render();
  }catch(e){}
}

function statusColor(s){
  if(s.includes('Delivered')) return 'background:#2f6b3a';
  if(s.includes('Shipped')) return 'background:#2b6ea6';
  if(s.includes('Cancelled')) return 'background:#a63b3b';
  if(s.includes('Pending')) return 'background:#b8862b';
  return 'background:#6b6b5f';
}

function MyOrders(){
  if(!state.customer) return CustomerLogin();
  if(state.orders.length===0){
    return `<div class="text-2xl font-bold my-6">My Orders</div><div class="card rounded-xl p-10 text-center muted">No orders yet. <button onclick="go('shop')" class="underline" style="color:var(--brand)">Start shopping</button></div>`;
  }
  return `
  <div class="text-2xl font-bold my-6">My Orders</div>
  <div class="space-y-4">
  ${state.orders.map(o=>`
    <div class="card rounded-xl p-5">
      <div class="flex flex-wrap justify-between items-center gap-2 mb-2">
        <div class="font-bold">#${o.order_id}</div>
        <span class="text-xs px-3 py-1 rounded-full text-white" style="${statusColor(o.status)}">${o.status}</span>
      </div>
      <div class="text-sm muted mb-2">${new Date(o.created_at).toLocaleString('en-IN')}</div>
      ${o.items.map(it=>`<div class="text-sm flex justify-between"><span>${it.name} x${it.qty}</span><span>${money(it.price*it.qty)}</span></div>`).join('')}
      <div class="flex justify-between font-bold pt-2 mt-2 border-t line">
        <span>Total (${o.payment_method})</span><span style="color:var(--brand)">${money(o.total)}</span>
      </div>
    </div>`).join('')}
  </div>`;
}

// ---------- Admin Dashboard ----------
async function loadAllOrders(){
  try{ state.allOrders = await api('/orders', { auth: 'admin' }); }catch(e){}
}

async function updateOrderStatus(orderId, status){
  try{
    await api(`/orders/${orderId}/status`, { method:'PATCH', body:{ status }, auth:'admin' });
    await loadAllOrders();
    showToast('Order updated');
    render();
  }catch(e){ showToast(e.message); }
}

function csvCell(v){
  const s = (v===undefined||v===null) ? '' : String(v);
  return '"' + s.replace(/"/g,'""') + '"';
}
function downloadCsv(filename, lines){
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function exportOrdersCSV(){
  const orders = state.allOrders;
  if(orders.length===0){ showToast('No orders to export'); return; }
  const header = ['Order ID','Date','Customer Name','Phone','Address','Items','Total','Payment Method','Status'];
  const lines = [header.map(csvCell).join(',')];
  orders.forEach(o=>{
    const itemsStr = o.items.map(it=>`${it.name} x${it.qty}`).join('; ');
    lines.push([o.order_id, new Date(o.created_at).toLocaleString('en-IN'), o.customer_name, o.phone, o.address, itemsStr, o.total, o.payment_method, o.status].map(csvCell).join(','));
  });
  downloadCsv('ayukripa-orders.csv', lines);
}

async function exportCustomersCSV(){
  try{
    const customers = await api('/orders/export/customers', { auth: 'admin' });
    if(customers.length===0){ showToast('No customers to export'); return; }
    const header = ['Username','Name','Email','Phone','Address','Signed Up'];
    const lines = [header.map(csvCell).join(',')];
    customers.forEach(c=>{
      lines.push([c.username, c.name, c.email, c.phone, c.address, new Date(c.created_at).toLocaleString('en-IN')].map(csvCell).join(','));
    });
    downloadCsv('ayukripa-customers.csv', lines);
  }catch(e){ showToast(e.message); }
}

function Admin(){
  if(!state.adminToken) return AdminLogin();
  const orders = state.allOrders;
  const totalRevenue = orders.filter(o=>!o.status.includes('Cancelled')).reduce((a,o)=>a+o.total,0);
  const statusOptions = ['Order Placed','Payment Verification Pending','Payment Confirmed','Processing','Shipped','Delivered','Cancelled'];
  return `
  <div class="flex flex-wrap justify-between items-center gap-3 my-6">
    <div class="text-2xl font-bold">Admin Dashboard</div>
    <div class="flex gap-2">
      <button onclick="exportOrdersCSV()" class="text-sm px-3 py-2 rounded-lg border line">⬇ Export Orders (CSV)</button>
      <button onclick="exportCustomersCSV()" class="text-sm px-3 py-2 rounded-lg border line">⬇ Export Customers (CSV)</button>
      <button onclick="loadAllOrders().then(render)" class="text-sm px-3 py-2 rounded-lg border line">↻ Refresh</button>
    </div>
  </div>
  <div class="grid sm:grid-cols-3 gap-4 mb-6">
    <div class="card rounded-xl p-5"><div class="text-sm muted">Total Orders</div><div class="text-2xl font-bold">${orders.length}</div></div>
    <div class="card rounded-xl p-5"><div class="text-sm muted">Total Revenue</div><div class="text-2xl font-bold" style="color:var(--brand)">${money(totalRevenue)}</div></div>
    <div class="card rounded-xl p-5"><div class="text-sm muted">Pending Verification</div><div class="text-2xl font-bold">${orders.filter(o=>o.status.includes('Pending')).length}</div></div>
  </div>
  ${orders.length===0 ? `<div class="card rounded-xl p-10 text-center muted">No orders yet.</div>` : `
  <div class="overflow-x-auto card rounded-xl">
  <table class="w-full text-sm">
    <thead><tr class="text-left border-b line">
      <th class="p-3">Order</th><th class="p-3">Customer</th><th class="p-3">Items</th><th class="p-3">Total</th><th class="p-3">Payment</th><th class="p-3">Status</th>
    </tr></thead>
    <tbody>
    ${orders.map(o=>`
      <tr class="border-b line align-top">
        <td class="p-3">
          <div class="font-semibold">#${o.order_id}</div>
          <div class="text-xs muted">${new Date(o.created_at).toLocaleString('en-IN')}</div>
        </td>
        <td class="p-3">
          <div class="font-semibold">${o.customer_name}</div>
          <div class="text-xs muted">${o.phone}</div>
          <div class="text-xs muted max-w-[180px]">${o.address}</div>
        </td>
        <td class="p-3">${o.items.map(it=>`<div>${it.name} x${it.qty}</div>`).join('')}</td>
        <td class="p-3 font-semibold">${money(o.total)}</td>
        <td class="p-3">${o.payment_method}</td>
        <td class="p-3">
          <select onchange="updateOrderStatus('${o.order_id}', this.value)" class="border line rounded-lg px-2 py-1">
            ${statusOptions.map(s=>`<option value="${s}" ${s===o.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>
  </div>`}`;
}

// ---------- Render ----------
function render(){
  const app = document.getElementById('app');
  let body = '';
  if(state.view==='home') body = Home();
  else if(state.view==='shop') body = Shop();
  else if(state.view.startsWith('product-')) body = ProductPage(state.view.replace('product-',''));
  else if(state.view==='cart') body = Cart();
  else if(state.view==='customer-login') body = CustomerLogin();
  else if(state.view==='customer-signup') body = CustomerSignup();
  else if(state.view==='checkout') body = Checkout();
  else if(state.view==='orders'){ body = MyOrders(); loadMyOrders(); }
  else if(state.view==='admin-login') body = AdminLogin();
  else if(state.view==='admin') body = Admin();
  else body = Home();

  app.innerHTML = Header() + body +
    (state.toast ? `<div class="fixed bottom-6 left-1/2 -translate-x-1/2 brand-btn px-5 py-3 rounded-xl shadow-lg z-50">${state.toast}</div>` : '') +
    `<div class="text-center text-xs muted mt-16 pt-6 border-t line">© ${new Date().getFullYear()} Ayukripa Wellness Care — Health is Priority</div>`;

  if(state.view==='checkout') renderPayArea();
}

async function init(){
  try{
    appConfig = await (await fetch('/api/config')).json();
  }catch(e){}
  if(state.adminToken){ await loadAllOrders(); }
  render();
}
init();
