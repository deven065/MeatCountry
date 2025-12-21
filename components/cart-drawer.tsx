"use client"
import { AnimatePresence, motion } from 'framer-motion'
import useCart from '@/components/store/cart'
import Price from '@/components/price'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, setQty, remove } = useCart()
  const subtotal = items.reduce((a, b) => a + b.price_inr * b.quantity, 0)
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.4 }}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Cart</h3>
              <button onClick={onClose} className="text-sm text-neutral-600 hover:underline">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 && <p className="text-sm text-neutral-500">Your cart is empty.</p>}
              {items.map((it) => {
                const itemKey = it.variant_id ? `${it.id}-${it.variant_id}` : it.id
                return (
                  <div key={itemKey} className="flex items-center gap-3">
                    <img src={it.image} alt={it.name} className="h-16 w-16 rounded object-cover bg-neutral-100" />
                    <div className="flex-1">
                      <p className="font-medium leading-tight">{it.name}</p>
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
            <div className="border-t p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <Price value={subtotal} />
              </div>
              <a href="/cart" className="block w-full text-center rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">Checkout</a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
