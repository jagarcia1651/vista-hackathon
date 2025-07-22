INSERT INTO "public"."holidays"
   ("holiday_id", "holiday_name", "holiday_type", "month", "day_of_month", "day_of_week", "week_number", "base_holiday_id", "days_variance", "special_calculation_flag", "created_at", "last_updated_at")
VALUES
   ('14d57f56-0c81-492d-8b9e-4b3798ab8c81', 'New Year''s Day', '0', '1', '1', null, null, null, null, '0', '2022-10-30 16:17:24.852732+00', '2023-04-15 16:17:24.852755+00'),
   ('462418d3-5998-40b4-94cc-a8ea05bb9fcf', 'Presidents'' Day', '1', '2', null, '2', '3', null, null, '0', '2024-05-02 16:17:24.852897+00', '2024-02-27 16:17:24.852907+00'),
   ('4d31dd71-b2d2-46f6-b200-d547fb8fd94b', 'Black Friday', '2', '11', null, null, null, '8cd4d534-b2fc-4558-9845-ec05449d9bd5', '1', '0', '2023-09-16 16:17:24.853169+00', '2023-04-14 16:17:24.853182+00'),
   ('7bc0b385-81b6-480b-a3e5-71cce667e64e', 'Labor Day', '1', '9', null, '2', '1', null, null, '0', '2023-09-07 16:17:24.853055+00', '2022-11-23 16:17:24.853062+00'),
   ('7bc31adc-d93e-456c-85d3-e5e21af6b39b', 'Christmas Eve', '0', '12', '24', null, null, null, null, '0', '2025-06-12 16:17:24.85325+00', '2024-11-17 16:17:24.85326+00'),
   ('8cd4d534-b2fc-4558-9845-ec05449d9bd5', 'Thanksgiving', '1', '11', null, '5', '4', null, null, '0', '2023-09-19 16:17:24.853105+00', '2023-09-23 16:17:24.853123+00'),
   ('ac80ed3e-dcd7-40e3-91c8-d6e050aab5e8', 'Martin Luther King Jr. Day', '1', '1', null, '2', '3', null, null, '0', '2023-02-14 16:17:24.852808+00', '2022-12-13 16:17:24.852821+00'),
   ('d6e34798-5289-42f7-afaa-447e8453fd6c', 'Independence Day', '0', '7', '4', null, null, null, null, '0', '2024-08-10 16:17:24.853012+00', '2025-04-08 16:17:24.85302+00'),
   ('e294e94a-b26a-43b3-b706-baeb27f330a4', 'Christmas Day', '0', '12', '25', null, null, null, null, '0', '2025-02-19 16:17:24.853403+00', '2025-05-24 16:17:24.853431+00'),
   ('eb7c9d6d-8819-4f83-893b-d08add78a57c', 'Memorial Day', '1', '5', null, '2', '-1', null, null, '0', '2023-01-19 16:17:24.852947+00', '2024-03-04 16:17:24.852961+00');