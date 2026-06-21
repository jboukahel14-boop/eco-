<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CartUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => 'required|integer|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'quantity.min' => 'Quantity cannot be negative. Use 0 to remove the item.',
            'quantity.max' => 'Quantity cannot exceed 100.',
        ];
    }
}
