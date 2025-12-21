"use client"
import useCart from '@/components/store/cart'
import Price from '@/components/price'

export default function CartPage() {
  const { items, setQty, remove, clear } = useCart()
  const subtotal = items.reduce((a, b) => a + b.price_inr * b.quantity, 0)
  return (
    <div className="py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        {items.length === 0 && <p className="text-sm text-neutral-600">Your cart is empty.</p>}
        <div className="space-y-4">
          {items.map((it) => {
            const itemKey = it.variant_id ? `${it.id}-${it.variant_id}` : it.id
            return (
              <div key={itemKey} className="flex items-center gap-3 border rounded-md p-3">
                <img src={it.image} alt={it.name} className="h-20 w-20 rounded object-cover bg-neutral-100" />
                <div className="flex-1">
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-neutral-500">{it.unit}</p>
                  <Price value={it.price_inr} />
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-6 w-6 border rounded" onClick={() => setQty(it.id, it.quantity - 1, it.variant_id)}>-</button>
                  <span className="text-sm w-6 text-center">{it.quantity}</span>
                  <button className="h-6 w-6 border rounded" onClick={() => setQty(it.id, it.quantity + 1, it.variant_id)}>+</button>
                </div>
                <button className="text-xs text-red-600" onClick={() => remove(it.id, it.variant_id)}>Remove</button>
              </div>
            )
          })}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-md border p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <Price value={subtotal} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Delivery (est.)</span>
            <span>Free</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <Price value={subtotal} />
          </div>
          <button className="w-full rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">Proceed to checkout</button>
        </div>
        {items.length > 0 && (
          <button className="text-sm text-neutral-600 hover:underline" onClick={() => clear()}>Clear cart</button>
        )}
      </div>
    </div>
  )
}
