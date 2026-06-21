import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CreditCard, Truck, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import type { CheckoutForm as CheckoutFormType } from '@/types';

interface CheckoutFormProps {
  onSubmit: (form: CheckoutFormType) => Promise<void>;
  isLoading: boolean;
}

const steps = ['Shipping', 'Payment', 'Review'];

const initialForm: CheckoutFormType = {
  shipping_name: '',
  shipping_email: '',
  shipping_phone: '',
  shipping_address_line1: '',
  shipping_address_line2: '',
  shipping_city: '',
  shipping_state: '',
  shipping_postal_code: '',
  shipping_country: 'US',
  payment_method: 'mock',
};

export function CheckoutForm({ onSubmit, isLoading }: CheckoutFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CheckoutFormType>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormType, string>>>({});

  const updateField = (field: keyof CheckoutFormType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormType, string>> = {};

    if (step === 0) {
      if (!form.shipping_name.trim()) newErrors.shipping_name = 'Name is required';
      if (!form.shipping_email.trim()) newErrors.shipping_email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.shipping_email))
        newErrors.shipping_email = 'Invalid email';
      if (!form.shipping_address_line1.trim()) newErrors.shipping_address_line1 = 'Address is required';
      if (!form.shipping_city.trim()) newErrors.shipping_city = 'City is required';
      if (!form.shipping_postal_code.trim()) newErrors.shipping_postal_code = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 2));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (step < 2) {
      nextStep();
      return;
    }
    await onSubmit(form);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-center gap-4">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                i <= step
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 text-surface-400'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`text-sm font-medium ${
                i <= step ? 'text-surface-900' : 'text-surface-400'
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 rounded ${
                  i < step ? 'bg-primary-600' : 'bg-surface-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard className="p-6 sm:p-8">
            {step === 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-lg font-semibold text-surface-900">
                  <Truck className="h-5 w-5 text-primary-600" />
                  Shipping Information
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Full Name *</label>
                    <input
                      value={form.shipping_name}
                      onChange={(e) => updateField('shipping_name', e.target.value)}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="John Doe"
                    />
                    {errors.shipping_name && <p className="mt-1 text-xs text-red-500">{errors.shipping_name}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Email *</label>
                    <input
                      type="email"
                      value={form.shipping_email}
                      onChange={(e) => updateField('shipping_email', e.target.value)}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="john@example.com"
                    />
                    {errors.shipping_email && <p className="mt-1 text-xs text-red-500">{errors.shipping_email}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Phone</label>
                    <input
                      value={form.shipping_phone}
                      onChange={(e) => updateField('shipping_phone', e.target.value)}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Address Line 1 *</label>
                    <input
                      value={form.shipping_address_line1}
                      onChange={(e) => updateField('shipping_address_line1', e.target.value)}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="123 Main St"
                    />
                    {errors.shipping_address_line1 && <p className="mt-1 text-xs text-red-500">{errors.shipping_address_line1}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Address Line 2</label>
                    <input
                      value={form.shipping_address_line2}
                      onChange={(e) => updateField('shipping_address_line2', e.target.value)}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Apt, Suite, etc."
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">City *</label>
                    <input
                      value={form.shipping_city}
                      onChange={(e) => updateField('shipping_city', e.target.value)}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="New York"
                    />
                    {errors.shipping_city && <p className="mt-1 text-xs text-red-500">{errors.shipping_city}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">State</label>
                    <input
                      value={form.shipping_state}
                      onChange={(e) => updateField('shipping_state', e.target.value)}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="NY"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Postal Code *</label>
                    <input
                      value={form.shipping_postal_code}
                      onChange={(e) => updateField('shipping_postal_code', e.target.value)}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="10001"
                    />
                    {errors.shipping_postal_code && <p className="mt-1 text-xs text-red-500">{errors.shipping_postal_code}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-surface-700">Country</label>
                    <select
                      value={form.shipping_country}
                      onChange={(e) => updateField('shipping_country', e.target.value)}
                      className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-lg font-semibold text-surface-900">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  Payment Method
                </div>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-surface-200 p-4 transition-all has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="mock"
                      checked={form.payment_method === 'mock'}
                      onChange={(e) => updateField('payment_method', e.target.value)}
                      className="h-4 w-4 text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-surface-900">Mock Payment (Test)</p>
                      <p className="text-sm text-surface-500">Simulate a successful payment</p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-surface-200 p-4 transition-all has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="stripe"
                      checked={form.payment_method === 'stripe'}
                      onChange={(e) => updateField('payment_method', e.target.value)}
                      className="h-4 w-4 text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-surface-900">Credit Card (Stripe)</p>
                      <p className="text-sm text-surface-500">Pay securely with Stripe</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-lg font-semibold text-surface-900">
                  <Check className="h-5 w-5 text-primary-600" />
                  Order Summary
                </div>

                <div className="space-y-3 rounded-xl bg-surface-50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Name</span>
                    <span className="font-medium">{form.shipping_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Email</span>
                    <span className="font-medium">{form.shipping_email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Address</span>
                    <span className="text-right font-medium">
                      {form.shipping_address_line1}
                      {form.shipping_address_line2 && `, ${form.shipping_address_line2}`}
                      <br />
                      {form.shipping_city}, {form.shipping_state} {form.shipping_postal_code}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Payment</span>
                    <span className="font-medium capitalize">{form.payment_method}</span>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 0 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isLoading}
          size="lg"
        >
          {step === 2 ? 'Place Order' : 'Continue'}
          {step < 2 && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
