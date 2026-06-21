<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_name' => 'required|string|max:255',
            'shipping_email' => 'required|email|max:255',
            'shipping_phone' => 'nullable|string|max:30|regex:/^[+\-\d\s()]+$/',
            'shipping_address_line1' => 'required|string|max:255',
            'shipping_address_line2' => 'nullable|string|max:255',
            'shipping_city' => 'required|string|max:120',
            'shipping_state' => 'nullable|string|max:120',
            'shipping_postal_code' => 'required|string|max:20',
            'shipping_country' => 'required|string|max:100',
            'payment_method' => 'nullable|string|in:stripe,mock',
            'payment.stripe_token' => 'required_if:payment_method,stripe|string',
        ];
    }

    public function messages(): array
    {
        return [
            'shipping_name.required' => 'Full name is required.',
            'shipping_email.required' => 'Email address is required.',
            'shipping_email.email' => 'Please provide a valid email address.',
            'shipping_address_line1.required' => 'Street address is required.',
            'shipping_city.required' => 'City is required.',
            'shipping_postal_code.required' => 'Postal/ZIP code is required.',
            'shipping_country.required' => 'Country is required.',
            'payment.stripe_token.required_if' => 'Stripe payment token is required.',
        ];
    }
}
