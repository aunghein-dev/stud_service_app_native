export type Settings = {
  school_name: string;
  school_address: string;
  school_phone: string;
  default_currency: string;
  receipt_prefix: string;
  receipt_last_number: number;
  payment_methods: string[];
  optional_item_defaults: string[];
  print_preferences: Record<string, unknown>;
};
