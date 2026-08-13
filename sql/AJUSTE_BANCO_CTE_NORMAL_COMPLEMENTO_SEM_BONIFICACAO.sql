-- Execute somente se NÃO utilizar `php artisan migrate`.
UPDATE travel_ctes SET cte_type = 'NORMAL' WHERE cte_type NOT IN ('NORMAL', 'FREIGHT_COMPLEMENT');
UPDATE travel_ctes SET bonus_amount = 0, gross_freight = COALESCE(net_freight,0)+COALESCE(insurance_amount,0)+COALESCE(toll_amount,0)+COALESCE(icms_amount,0);
UPDATE travels SET cte_type = 'NORMAL' WHERE cte_type NOT IN ('NORMAL', 'FREIGHT_COMPLEMENT');
UPDATE travels SET bonus_amount = 0, gross_freight = COALESCE(net_freight,0)+COALESCE(insurance_amount,0)+COALESCE(toll_amount,0)+COALESCE(icms_amount,0);
