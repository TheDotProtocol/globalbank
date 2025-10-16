-- Verify all TransactionType enum values
-- Run this script LAST to check all values exist

SELECT unnest(enum_range(NULL::"TransactionType")) as transaction_type_values;
