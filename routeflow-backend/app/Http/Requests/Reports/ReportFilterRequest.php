<?php

namespace App\Http\Requests\Reports;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class ReportFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('reports.view');
    }

    public function rules(): array
    {
        return [
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'driver_id' => ['nullable', 'integer'],
            'warehouse_id' => ['nullable', 'integer'],
        ];
    }

    /** Defaults to the last 30 days when no range is given. */
    public function from(): Carbon
    {
        return $this->filled('from')
            ? Carbon::parse($this->input('from'))->startOfDay()
            : now()->subDays(30)->startOfDay();
    }

    public function to(): Carbon
    {
        return $this->filled('to')
            ? Carbon::parse($this->input('to'))->endOfDay()
            : now()->endOfDay();
    }
}
