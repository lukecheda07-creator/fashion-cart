import { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingBag, X, Plus, Minus, ArrowUpRight, SlidersHorizontal, ChevronDown, Heart, ArrowLeft, Check, Trash2, Menu } from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

type Category = 'All' | 'Outerwear' | 'Knitwear' | 'Dresses' | 'Trousers';
type Product = {
  id: string;
  name: string;
  category: Exclude<Category, 'All'>;
  price: number;
  color: string;
  description: string;
  material: string;
  image: string;
  alt: string;
  sizes: string[];
  badge?: string;
};
type CartItem = Product & { size: string; quantity: number };

const PRODUCTS: Product[] = [
  { id: 'atelier-wrap', name: 'Atelier Wrap Coat', category: 'Outerwear', price: 39990, color: 'Ecru', description: 'A long, generous wrap coat with a softly architectural shoulder and a tie that finds the waist without forcing it.', material: 'Italian wool / cashmere', image: '/coat.jpg', alt: 'Model wearing an ecru wrap coat on a cobalt backdrop', sizes: ['XS', 'S', 'M', 'L'], badge: 'The considered layer' },
  { id: 'ink-merino', name: 'Ink Merino Crew', category: 'Knitwear', price: 15990, color: 'Deep Ink', description: 'The everyday knit, made less everyday. A dense merino jersey with a little air in the sleeve.', material: '100% extra-fine merino wool', image: '/knit.jpg', alt: 'Model wearing an ink navy merino knit', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: 'terra-silk', name: 'Terra Bias Dress', category: 'Dresses', price: 27990, color: 'Terra', description: 'Cut on the bias to follow the body, never announce it. A low-gloss silk dress for late light.', material: 'Silk satin, 19 momme', image: '/dress.jpg', alt: 'Model wearing a rust red silk bias dress', sizes: ['XS', 'S', 'M', 'L'], badge: 'New form' },
  { id: 'line-trouser', name: 'Line Pleat Trouser', category: 'Trousers', price: 18990, color: 'Charcoal', description: 'A clean front, a deep pleat, and a full leg that holds its shape through the day.', material: 'Wool / recycled poly blend', image: '/trouser.jpg', alt: 'Model wearing charcoal pleated trousers', sizes: ['28', '30', '32', '34', '36'] },
  { id: 'cinder-blazer', name: 'Cinder Single Blazer', category: 'Outerwear', price: 32990, color: 'Cinder', description: 'A relaxed single-breasted blazer with a precise lapel and an easy, unlined interior.', material: 'Brushed wool twill', image: '/coat.jpg', alt: 'Editorial image of a dark tailored blazer', sizes: ['XS', 'S', 'M', 'L'] },
  { id: 'salt-cardigan', name: 'Salt Rib Cardigan', category: 'Knitwear', price: 13990, color: 'Salt', description: 'A compact rib with a clean neck and the right amount of slouch. Wear it close or let it drift.', material: 'Organic cotton / alpaca', image: '/knit.jpg', alt: 'Editorial image of a pale rib cardigan', sizes: ['XS', 'S', 'M', 'L'], badge: 'Quiet essential' },
  { id: 'column-dress', name: 'Column Jersey Dress', category: 'Dresses', price: 20990, color: 'Night', description: 'A fluid column in a weighty jersey. The kind of dress that makes plans feel simpler.', material: 'Tencel jersey', image: '/dress.jpg', alt: 'Editorial image of a dark jersey dress', sizes: ['XS', 'S', 'M', 'L'] },
  { id: 'studio-pant', name: 'Studio Wide Pant', category: 'Trousers', price: 16990, color: 'Oat', description: 'High-waisted and softly tailored, with a line that looks as good sitting down as it does walking away.', material: 'Portuguese cotton canvas', image: '/trouser.jpg', alt: 'Editorial image of tailored oat trousers', sizes: ['28', '30', '32', '34', '36'] },
];

const FREE_DELIVERY_THRESHOLD = 20000;
const DELIVERY_CHARGE = 999;
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const queryClient = new QueryClient();

function Header({ count, onBag, onSearch }: { count: number; onBag: () => void; onSearch: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="bg-[#e56750] px-5 py-2 text-center text-[10px] font-semibold uppercase tracking-[.22em] text-[#202b50]">
        Complimentary delivery on orders over ₹20,000 · Made in small runs
      </div>
      <header className="sticky top-0 z-40 border-b border-[#202b50]/15 bg-[#f3efe4]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-5 md:px-10">
          <button className="flex items-center gap-3 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu" data-testid="button-open-menu">
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <Link href="/" className="flex items-center gap-2 text-[#202b50]" data-testid="link-home">
            <span className="text-[18px] font-bold tracking-[.1em]">NOIR / FORM</span>
            <span className="hidden border-l border-[#202b50]/30 pl-2 font-mono-fashion text-[9px] uppercase tracking-[.15em] text-[#202b50]/60 sm:inline">Wardrobe study no. 04</span>
          </Link>
          <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 top-[74px] w-full flex-col gap-4 border-b border-[#202b50]/15 bg-[#f3efe4] px-5 py-5 text-xs uppercase tracking-[.18em] md:static md:flex md:w-auto md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0`} aria-label="Main navigation">
            {(['New arrivals', 'Outerwear', 'Knitwear', 'Dresses'] as const).map((item) => (
              <a href="#catalog" key={item} onClick={(event) => { event.preventDefault(); window.dispatchEvent(new CustomEvent('noir-category', { detail: item === 'New arrivals' ? 'All' : item })); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); }} className="transition-colors hover:text-[#e56750]" data-testid={`link-nav-${item.toLowerCase().replace(' ', '-')}`}>{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <button onClick={onSearch} aria-label="Search the collection" className="group flex items-center gap-2 text-[11px] uppercase tracking-[.15em]" data-testid="button-search">
              <Search size={18} strokeWidth={1.5} className="transition-transform group-hover:scale-110" /><span className="hidden lg:inline">Search</span>
            </button>
            <button onClick={onBag} aria-label={`Open shopping bag, ${count} items`} className="group relative flex items-center gap-2 text-[11px] uppercase tracking-[.15em]" data-testid="button-open-bag">
              <ShoppingBag size={18} strokeWidth={1.5} className="transition-transform group-hover:-rotate-6" /><span className="hidden lg:inline">Bag</span>
              <span className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-[#202b50] px-1 font-mono-fashion text-[10px] text-[#f3efe4] ${count ? 'bag-pop' : ''}`} data-testid="text-bag-count">{count}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function Hero({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="mx-auto grid max-w-[1440px] grid-cols-1 px-5 pt-5 md:grid-cols-[1.05fr_.95fr] md:px-10">
      <div className="flex min-h-[560px] flex-col justify-between bg-[#202b50] p-7 text-[#f3efe4] md:min-h-[690px] md:p-12 lg:p-16">
        <div className="flex items-start justify-between">
          <span className="font-mono-fashion text-[10px] uppercase tracking-[.22em] text-[#f3efe4]/65">Collection / 04—25</span>
          <span className="font-mono-fashion text-[10px] uppercase tracking-[.22em] text-[#f3efe4]/65">01 — 08</span>
        </div>
        <div className="stagger-in max-w-[700px]">
          <p className="mb-5 text-xs uppercase tracking-[.22em] text-[#e56750]">A study in restraint</p>
          <h1 className="font-display text-[clamp(4.4rem,10vw,9.4rem)] leading-[.82] tracking-[-.06em]">Fewer.<br /><em>Better.</em><br />Forever.</h1>
          <div className="mt-9 flex max-w-[390px] items-end justify-between gap-5">
            <p className="text-sm leading-6 text-[#f3efe4]/70">A curated wardrobe of pieces with a point of view. Made slowly, worn often.</p>
            <button onClick={onExplore} className="group flex shrink-0 items-center gap-2 border-b border-[#e56750] pb-2 text-xs uppercase tracking-[.16em] text-[#e56750]" data-testid="button-explore-collection">Explore <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></button>
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-[#f3efe4]/20 pt-4 font-mono-fashion text-[9px] uppercase tracking-[.16em] text-[#f3efe4]/55">
          <span>For the in-between hours</span><span>Scroll to discover ↓</span>
        </div>
      </div>
      <div className="relative min-h-[470px] overflow-hidden bg-[#e6c76b] md:min-h-[690px]">
        <img src="/coat.jpg" alt="Model in Atelier Wrap Coat" className="h-full w-full object-cover object-center mix-blend-multiply transition-transform duration-1000 hover:scale-[1.03]" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-[#202b50] md:bottom-9 md:left-9 md:right-9">
          <div><p className="font-mono-fashion text-[9px] uppercase tracking-[.2em]">Look 01 / The long way home</p><p className="mt-2 font-display text-2xl italic">Atelier Wrap Coat</p></div>
           <span className="border border-[#202b50]/50 bg-[#e6c76b]/70 px-3 py-2 font-mono-fashion text-[10px]">{money(PRODUCTS[0].price)}</span>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index, onQuickView, onAdd }: { product: Product; index: number; onQuickView: (p: Product) => void; onAdd: (p: Product) => void }) {
  return (
    <article className="product-card group stagger-in" style={{ animationDelay: `${index * 75}ms` }} data-testid={`card-product-${product.id}`}>
      <button onClick={() => onQuickView(product)} className="relative block aspect-[.78] w-full overflow-hidden bg-[#ded8c9] text-left" data-testid={`button-quick-view-${product.id}`}>
        <img src={product.image} alt={product.alt} className="product-image h-full w-full object-cover" />
        {product.badge && <span className="absolute left-3 top-3 bg-[#f3efe4] px-2 py-1 font-mono-fashion text-[9px] uppercase tracking-[.12em] text-[#202b50]">{product.badge}</span>}
        <span className="absolute bottom-3 right-3 translate-y-2 bg-[#202b50] px-3 py-2 text-[10px] uppercase tracking-[.14em] text-[#f3efe4] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">Quick view</span>
      </button>
      <div className="flex items-start justify-between gap-3 py-4">
        <div><Link href={`/product/${product.id}`} className="text-[14px] font-semibold tracking-[-.01em] hover:text-[#e56750]" data-testid={`link-product-${product.id}`}>{product.name}</Link><p className="mt-1 font-mono-fashion text-[10px] uppercase tracking-[.1em] text-[#202b50]/55">{product.color} · {product.category}</p></div>
        <div className="text-right"><p className="font-mono-fashion text-[12px]">{money(product.price)}</p><button onClick={() => onAdd(product)} className="mt-2 border-b border-[#202b50]/30 pb-0.5 text-[10px] uppercase tracking-[.12em] transition-colors hover:border-[#e56750] hover:text-[#e56750]" data-testid={`button-add-${product.id}`}>Add to bag</button></div>
      </div>
    </article>
  );
}

function Catalog({ onQuickView, onAdd }: { onQuickView: (p: Product) => void; onAdd: (p: Product) => void }) {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const categories: Category[] = ['All', 'Outerwear', 'Knitwear', 'Dresses', 'Trousers'];
  useEffect(() => {
    const handleSearch = (event: Event) => setQuery((event as CustomEvent<string>).detail);
    window.addEventListener('noir-search', handleSearch);
    return () => window.removeEventListener('noir-search', handleSearch);
  }, []);
  useEffect(() => {
    const handleCategory = (event: Event) => setCategory((event as CustomEvent<Category>).detail);
    window.addEventListener('noir-category', handleCategory);
    return () => window.removeEventListener('noir-category', handleCategory);
  }, []);
  const visible = useMemo(() => {
    const filtered = PRODUCTS.filter((p) => (category === 'All' || p.category === category) && `${p.name} ${p.category} ${p.color}`.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : PRODUCTS.indexOf(a) - PRODUCTS.indexOf(b));
  }, [category, query, sort]);
  return (
    <section id="catalog" className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
      <div className="mb-10 flex flex-col justify-between gap-7 md:flex-row md:items-end">
        <div><p className="mb-3 font-mono-fashion text-[10px] uppercase tracking-[.22em] text-[#e56750]">The collection</p><h2 className="font-display text-5xl leading-none tracking-[-.04em] md:text-7xl">Pieces with<br /><em>staying power.</em></h2></div>
        <p className="max-w-[270px] text-sm leading-6 text-[#202b50]/60">Nothing here is filler. Browse the full edit, then take your time with the details.</p>
      </div>
      <div className="mb-7 flex flex-col gap-5 border-y border-[#202b50]/15 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`text-[11px] uppercase tracking-[.15em] transition-colors ${category === item ? 'font-bold text-[#e56750]' : 'text-[#202b50]/55 hover:text-[#202b50]'}`} data-testid={`button-category-${item.toLowerCase()}`}>{item}</button>)}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-2 text-[10px] uppercase tracking-[.15em] md:hidden" data-testid="button-mobile-filter"><SlidersHorizontal size={15} /> Filter</button>
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-[.15em]"><span className="hidden text-[#202b50]/45 sm:inline">Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="cursor-pointer bg-transparent text-[10px] uppercase tracking-[.12em] outline-none" data-testid="select-sort"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select><ChevronDown size={14} /></label>
        </div>
      </div>
      <div className={`${filterOpen ? 'block' : 'hidden'} mb-6 md:hidden`}><div className="border border-[#202b50]/20 bg-[#e8e2d5] p-4"><label className="flex items-center gap-3 text-xs"><span className="uppercase tracking-[.14em]">Search edit</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Coat, knit, dress..." className="min-w-0 flex-1 border-b border-[#202b50]/30 bg-transparent px-2 py-1 outline-none placeholder:text-[#202b50]/35" data-testid="input-mobile-search" /></label></div></div>
      <div className="mb-7 hidden items-center justify-between md:flex"><p className="font-mono-fashion text-[10px] uppercase tracking-[.15em] text-[#202b50]/50">{visible.length} / 08 pieces</p><label className="flex w-64 items-center gap-3 border-b border-[#202b50]/25 pb-2"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the edit" className="w-full bg-transparent text-xs outline-none placeholder:text-[#202b50]/40" data-testid="input-search-catalog" /></label></div>
      {visible.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5 md:gap-y-16">{visible.map((product, index) => <ProductCard key={product.id} product={product} index={index} onQuickView={onQuickView} onAdd={onAdd} />)}</div> : <div className="border-y border-[#202b50]/15 py-24 text-center"><p className="font-display text-4xl italic">Nothing by that name.</p><p className="mt-3 text-sm text-[#202b50]/55">Try a different material, category, or silhouette.</p><button onClick={() => { setQuery(''); setCategory('All'); }} className="mt-7 border-b border-[#e56750] pb-1 text-[10px] uppercase tracking-[.17em] text-[#e56750]" data-testid="button-clear-search">Clear the edit</button></div>}
    </section>
  );
}

function QuickView({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (p: Product, size: string) => void }) {
  const [size, setSize] = useState(product.sizes[1] || product.sizes[0]);
  useEffect(() => { const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }, [onClose]);
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#202b50]/55 p-0 backdrop-blur-sm md:items-center md:p-8" role="dialog" aria-modal="true" aria-label={`Quick view ${product.name}`} data-testid="dialog-quick-view">
    <div className="relative grid max-h-[94dvh] w-full max-w-4xl grid-cols-1 overflow-auto bg-[#f3efe4] md:grid-cols-2">
      <button onClick={onClose} aria-label="Close quick view" className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#f3efe4]/80" data-testid="button-close-quick-view"><X size={18} /></button>
      <div className="aspect-[.82] bg-[#ded8c9] md:aspect-auto"><img src={product.image} alt={product.alt} className="h-full w-full object-cover" /></div>
      <div className="flex flex-col justify-between p-7 md:p-10">
        <div><p className="font-mono-fashion text-[10px] uppercase tracking-[.2em] text-[#e56750]">{product.category} / {product.color}</p><h2 className="mt-4 font-display text-4xl leading-[.95] tracking-[-.04em] md:text-5xl">{product.name}</h2><p className="mt-6 text-sm leading-6 text-[#202b50]/65">{product.description}</p><div className="mt-8 border-t border-[#202b50]/15 pt-5"><p className="font-mono-fashion text-[10px] uppercase tracking-[.16em] text-[#202b50]/50">Choose size</p><div className="mt-3 flex flex-wrap gap-2">{product.sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={`h-10 min-w-11 border px-3 text-xs transition-colors ${size === s ? 'border-[#202b50] bg-[#202b50] text-[#f3efe4]' : 'border-[#202b50]/25 hover:border-[#202b50]'}`} data-testid={`button-size-${product.id}-${s}`}>{s}</button>)}</div></div></div>
        <div className="mt-10"><div className="mb-4 flex items-center justify-between font-mono-fashion text-xs"><span>{product.material}</span><span>{money(product.price)}</span></div><button onClick={() => onAdd(product, size)} className="flex w-full items-center justify-center gap-3 bg-[#e56750] py-4 text-[11px] font-bold uppercase tracking-[.16em] text-[#202b50] transition-transform hover:-translate-y-0.5" data-testid={`button-quick-add-${product.id}`}>Add to bag <Plus size={15} /></button><Link href={`/product/${product.id}`} onClick={onClose} className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.16em] text-[#202b50]/60 hover:text-[#e56750]" data-testid={`link-view-details-${product.id}`}>View full details <ArrowUpRight size={14} /></Link></div>
      </div>
    </div>
  </div>;
}

function BagDrawer({ items, onClose, onChange, onRemove, onCheckout }: { items: CartItem[]; onClose: () => void; onChange: (id: string, size: string, delta: number) => void; onRemove: (id: string, size: string) => void; onCheckout: () => void }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <div className="fixed inset-0 z-50 bg-[#202b50]/45 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Shopping bag" data-testid="dialog-bag">
    <button onClick={onClose} className="absolute inset-0 cursor-default" aria-label="Close bag" data-testid="button-close-bag-overlay" />
    <aside className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-[#f3efe4] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#202b50]/15 px-6 py-5"><div><p className="font-mono-fashion text-[9px] uppercase tracking-[.2em] text-[#e56750]">Your edit</p><h2 className="mt-1 font-display text-3xl italic">The bag <span className="font-sans text-xs not-italic text-[#202b50]/45">({items.length})</span></h2></div><button onClick={onClose} aria-label="Close bag" className="flex h-9 w-9 items-center justify-center border border-[#202b50]/20" data-testid="button-close-bag"><X size={18} /></button></div>
      {items.length ? <><div className="flex-1 overflow-auto px-6 py-5">{items.map((item) => <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-[#202b50]/15 py-5 first:pt-0" data-testid={`row-cart-${item.id}`}><img src={item.image} alt={item.alt} className="h-28 w-24 object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><div><Link href={`/product/${item.id}`} onClick={onClose} className="text-sm font-semibold" data-testid={`link-cart-product-${item.id}`}>{item.name}</Link><p className="mt-1 font-mono-fashion text-[10px] uppercase tracking-[.1em] text-[#202b50]/50">{item.color} / Size {item.size}</p></div><button onClick={() => onRemove(item.id, item.size)} aria-label={`Remove ${item.name}`} className="text-[#202b50]/45 hover:text-[#e56750]" data-testid={`button-remove-${item.id}`}><Trash2 size={15} /></button></div><div className="mt-7 flex items-center justify-between"><div className="flex items-center border border-[#202b50]/25"><button onClick={() => onChange(item.id, item.size, -1)} className="p-2 hover:bg-[#202b50]/5" aria-label="Decrease quantity" data-testid={`button-decrease-${item.id}`}><Minus size={13} /></button><span className="w-7 text-center font-mono-fashion text-xs">{item.quantity}</span><button onClick={() => onChange(item.id, item.size, 1)} className="p-2 hover:bg-[#202b50]/5" aria-label="Increase quantity" data-testid={`button-increase-${item.id}`}><Plus size={13} /></button></div><span className="font-mono-fashion text-xs">{money(item.price * item.quantity)}</span></div></div></div>)}</div><div className="border-t border-[#202b50]/15 px-6 py-6"><div className="mb-3 flex justify-between text-xs text-[#202b50]/55"><span>Delivery</span><span>{subtotal >= FREE_DELIVERY_THRESHOLD ? 'Complimentary' : money(DELIVERY_CHARGE)}</span></div><div className="mb-5 flex justify-between border-t border-[#202b50]/15 pt-4 font-mono-fashion text-sm"><span>Total</span><span>{money(subtotal + (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE))}</span></div><button onClick={onCheckout} className="w-full bg-[#202b50] py-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#f3efe4] transition-colors hover:bg-[#e56750] hover:text-[#202b50]" data-testid="button-checkout">Continue to checkout</button><p className="mt-3 text-center text-[10px] text-[#202b50]/45">Taxes calculated at checkout</p></div></> : <div className="flex flex-1 flex-col items-center justify-center px-10 text-center"><div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-[#202b50]/20"><ShoppingBag size={27} strokeWidth={1} /></div><h3 className="font-display text-4xl italic">A quiet bag.</h3><p className="mt-3 max-w-[240px] text-sm leading-6 text-[#202b50]/55">Your considered pieces will live here. Start with one good thing.</p><button onClick={onClose} className="mt-8 border-b border-[#e56750] pb-1 text-[10px] uppercase tracking-[.18em] text-[#e56750]" data-testid="button-browse-from-empty">Browse the collection</button></div>}
    </aside>
  </div>;
}

function CheckoutSummary({ items, onBack, onClose }: { items: CartItem[]; onBack: () => void; onClose: () => void }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE);
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#202b50]/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Checkout summary" data-testid="dialog-checkout"><div className="relative w-full max-w-2xl bg-[#f3efe4] p-7 md:p-10"><button onClick={onClose} aria-label="Close checkout" className="absolute right-5 top-5" data-testid="button-close-checkout"><X size={18} /></button><p className="font-mono-fashion text-[10px] uppercase tracking-[.2em] text-[#e56750]">Almost yours</p><h2 className="mt-2 font-display text-5xl leading-none">Review your<br /><em>considered choices.</em></h2><div className="mt-8 border-y border-[#202b50]/15 py-2">{items.map((item) => <div key={`${item.id}-${item.size}`} className="flex items-center justify-between gap-4 border-b border-[#202b50]/10 py-4 last:border-0"><div className="flex items-center gap-3"><img src={item.image} alt="" className="h-12 w-10 object-cover" /><div><p className="text-sm">{item.name}</p><p className="font-mono-fashion text-[10px] text-[#202b50]/50">{item.quantity} × {item.size}</p></div></div><span className="font-mono-fashion text-xs">{money(item.price * item.quantity)}</span></div>)}</div><div className="mt-5 space-y-2 text-xs"><div className="flex justify-between text-[#202b50]/60"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between text-[#202b50]/60"><span>Delivery</span><span>{subtotal >= FREE_DELIVERY_THRESHOLD ? 'Complimentary' : money(DELIVERY_CHARGE)}</span></div><div className="flex justify-between border-t border-[#202b50]/15 pt-4 font-mono-fashion"><span>Total</span><span>{money(total)}</span></div></div><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button onClick={onBack} className="flex items-center justify-center gap-2 border-b border-[#202b50]/30 pb-1 text-[10px] uppercase tracking-[.15em]" data-testid="button-back-to-bag"><ArrowLeft size={14} /> Back to bag</button><button onClick={onClose} className="flex items-center justify-center gap-2 bg-[#e56750] px-7 py-4 text-[10px] font-bold uppercase tracking-[.16em]" data-testid="button-place-order">Place order <Check size={15} /></button></div></div></div>;
}

function Footer() {
  return <footer className="bg-[#202b50] px-5 py-14 text-[#f3efe4] md:px-10 md:py-20"><div className="mx-auto max-w-[1440px]"><div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><p className="text-2xl font-bold tracking-[.08em]">NOIR / FORM</p><p className="mt-5 max-w-[250px] text-sm leading-6 text-[#f3efe4]/60">A smaller wardrobe, considered from every angle.</p></div><div><p className="mb-4 font-mono-fashion text-[10px] uppercase tracking-[.18em] text-[#e56750]">Explore</p><div className="space-y-3 text-sm text-[#f3efe4]/70"><a href="#catalog" className="block hover:text-[#e56750]">All pieces</a><a href="#catalog" className="block hover:text-[#e56750]">New arrivals</a><a href="#catalog" className="block hover:text-[#e56750]">Journal</a></div></div><div><p className="mb-4 font-mono-fashion text-[10px] uppercase tracking-[.18em] text-[#e56750]">Care</p><div className="space-y-3 text-sm text-[#f3efe4]/70"><a href="#catalog" className="block hover:text-[#e56750]">Shipping + returns</a><a href="#catalog" className="block hover:text-[#e56750]">Size guide</a><a href="#catalog" className="block hover:text-[#e56750]">Material index</a></div></div><div><p className="mb-4 font-mono-fashion text-[10px] uppercase tracking-[.18em] text-[#e56750]">Notes</p><p className="text-sm leading-6 text-[#f3efe4]/70">New work, once a month.<br />No noise. Promise.</p><div className="mt-4 flex border-b border-[#f3efe4]/35 pb-2"><input placeholder="Your email" className="w-full bg-transparent text-sm outline-none placeholder:text-[#f3efe4]/45" aria-label="Email for notes" data-testid="input-email" /><button aria-label="Subscribe to notes" className="text-[#e56750]" data-testid="button-subscribe"><ArrowUpRight size={18} /></button></div></div></div><div className="mt-16 flex flex-col justify-between gap-3 border-t border-[#f3efe4]/15 pt-5 font-mono-fashion text-[9px] uppercase tracking-[.14em] text-[#f3efe4]/45 sm:flex-row"><span>© 2025 Noir / Form</span><span>Made for keeping</span></div></div></footer>;
}

function Storefront({ cart, addToCart, changeCart, removeFromCart }: { cart: CartItem[]; addToCart: (p: Product, size?: string) => void; changeCart: (id: string, size: string, delta: number) => void; removeFromCart: (id: string, size: string) => void }) {
  const [, setLocation] = useLocation();
  const [bagOpen, setBagOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const add = (p: Product, size?: string) => { addToCart(p, size); setBagOpen(true); setQuickView(null); };
  return <div className="grain min-h-[100dvh] bg-[#f3efe4]"><Header count={count} onBag={() => setBagOpen(true)} onSearch={() => { setSearchOpen(true); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }} /><main><Hero onExplore={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} /><div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-7 font-mono-fashion text-[9px] uppercase tracking-[.18em] text-[#202b50]/45 md:px-10"><span className="h-px flex-1 bg-[#202b50]/15" /><span>Designed in the in-between</span><span className="h-px flex-1 bg-[#202b50]/15" /></div><Catalog onQuickView={setQuickView} onAdd={add} /><section className="mx-auto mb-28 max-w-[1440px] px-5 md:px-10"><div className="grid overflow-hidden bg-[#e56750] md:grid-cols-[.8fr_1.2fr]"><div className="flex flex-col justify-between p-8 md:p-12"><div><p className="font-mono-fashion text-[10px] uppercase tracking-[.2em] text-[#202b50]/65">The material note</p><h2 className="mt-16 font-display text-5xl leading-[.9] tracking-[-.04em] md:text-7xl">Wear the<br /><em>evidence.</em></h2></div><p className="mt-12 max-w-[270px] text-sm leading-6 text-[#202b50]/70">We choose fabric for the way it changes. The crease, the softening, the small proof of a life well worn.</p></div><div className="relative min-h-[360px] overflow-hidden bg-[#d7c78c] md:min-h-[500px]"><img src="/trouser.jpg" alt="Close editorial detail of tailored clothing" className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 hover:scale-105" /><span className="absolute bottom-6 right-6 font-mono-fashion text-[9px] uppercase tracking-[.16em] text-[#202b50]">Wool / Tencel / Silk</span></div></div></section></main><Footer />{quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} onAdd={add} />}{bagOpen && <BagDrawer items={cart} onClose={() => setBagOpen(false)} onChange={changeCart} onRemove={removeFromCart} onCheckout={() => { setBagOpen(false); setCheckoutOpen(true); }} />}{checkoutOpen && <CheckoutSummary items={cart} onBack={() => { setCheckoutOpen(false); setBagOpen(true); }} onClose={() => { setCheckoutOpen(false); setLocation('/'); }} />}{searchOpen && <div className="fixed left-1/2 top-[88px] z-30 w-[calc(100%-40px)] max-w-xl -translate-x-1/2 border border-[#202b50]/20 bg-[#f3efe4] p-4 shadow-xl md:top-[100px]"><div className="flex items-center gap-3"><Search size={18} /><input autoFocus placeholder="Search coats, knits, dresses..." className="w-full bg-transparent text-sm outline-none" onChange={(e) => window.dispatchEvent(new CustomEvent('noir-search', { detail: e.target.value }))} data-testid="input-search-overlay" /><button onClick={() => setSearchOpen(false)} aria-label="Close search" data-testid="button-close-search"><X size={18} /></button></div></div>}</div>;
}

function ProductDetail({ cart, addToCart }: { cart: CartItem[]; addToCart: (p: Product, size?: string) => void }) {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const product = PRODUCTS.find((p) => p.id === params.id) || PRODUCTS[0];
  const [size, setSize] = useState(product.sizes[1] || product.sizes[0]);
  const [added, setAdded] = useState(false);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const add = () => { addToCart(product, size); setAdded(true); window.setTimeout(() => setAdded(false), 1500); };
  return <div className="grain min-h-[100dvh] bg-[#f3efe4]"><Header count={count} onBag={() => setLocation('/')} onSearch={() => setLocation('/#catalog')} /><main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 md:py-12"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-[#202b50]/55 hover:text-[#e56750]" data-testid="link-back-to-collection"><ArrowLeft size={14} /> Back to collection</Link><div className="grid gap-10 md:grid-cols-[1.08fr_.92fr] md:gap-16"><div className="grid grid-cols-2 gap-3"><div className="col-span-2 aspect-[1.15] overflow-hidden bg-[#ded8c9]"><img src={product.image} alt={product.alt} className="h-full w-full object-cover" /></div><div className="aspect-[.8] overflow-hidden bg-[#ded8c9]"><img src={product.image} alt="" className="h-full w-full object-cover object-[65%] saturate-[.8]" /></div><div className="flex items-end bg-[#e56750] p-5 md:p-8"><p className="font-display text-3xl leading-[.92] text-[#202b50] md:text-4xl">Made to be<br /><em>lived in.</em></p></div></div><div className="md:pt-8"><p className="font-mono-fashion text-[10px] uppercase tracking-[.2em] text-[#e56750]">{product.category} / {product.color}</p><h1 className="mt-5 max-w-[450px] font-display text-6xl leading-[.86] tracking-[-.05em] md:text-8xl">{product.name}</h1><p className="mt-7 font-mono-fashion text-sm">{money(product.price)}</p><p className="mt-7 max-w-[440px] text-sm leading-7 text-[#202b50]/65">{product.description}</p><div className="my-9 border-y border-[#202b50]/15 py-6"><div className="flex justify-between"><span className="font-mono-fashion text-[10px] uppercase tracking-[.16em] text-[#202b50]/50">Select size</span><button className="text-[10px] uppercase tracking-[.13em] underline underline-offset-4" data-testid="button-size-guide">Size guide</button></div><div className="mt-4 flex flex-wrap gap-2">{product.sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={`h-11 min-w-12 border px-3 text-xs transition-colors ${size === s ? 'border-[#202b50] bg-[#202b50] text-[#f3efe4]' : 'border-[#202b50]/25 hover:border-[#202b50]'}`} data-testid={`button-detail-size-${s}`}>{s}</button>)}</div></div><button onClick={add} className="flex w-full items-center justify-center gap-3 bg-[#e56750] py-5 text-[11px] font-bold uppercase tracking-[.18em] text-[#202b50] transition-transform hover:-translate-y-0.5" data-testid="button-detail-add">{added ? <>Added to bag <Check size={16} /></> : <>Add to bag <Plus size={16} /></>}</button><div className="mt-8 space-y-4 border-t border-[#202b50]/15 pt-5"><div className="flex items-center justify-between text-xs"><span>Materials</span><span className="text-[#202b50]/55">{product.material}</span></div><div className="flex items-center justify-between text-xs"><span>Delivery</span><span className="text-[#202b50]/55">2—4 working days</span></div><div className="flex items-center justify-between text-xs"><span>Returns</span><span className="text-[#202b50]/55">30 days, easy returns</span></div></div><button className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[#202b50]/55 hover:text-[#e56750]" data-testid="button-save-piece"><Heart size={15} /> Save this piece</button></div></div></main><Footer /></div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const addToCart = (product: Product, size = product.sizes[1] || product.sizes[0]) => setCart((items) => {
    const existing = items.find((item) => item.id === product.id && item.size === size);
    return existing ? items.map((item) => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, size, quantity: 1 }];
  });
  const changeCart = (id: string, size: string, delta: number) => setCart((items) => items.map((item) => item.id === id && item.size === size ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity > 0));
  const removeFromCart = (id: string, size: string) => setCart((items) => items.filter((item) => !(item.id === id && item.size === size)));
  return <RoutedErrorBoundary><Switch><Route path="/" component={() => <Storefront cart={cart} addToCart={addToCart} changeCart={changeCart} removeFromCart={removeFromCart} />} /><Route path="/product/:id" component={() => <ProductDetail cart={cart} addToCart={addToCart} />} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;