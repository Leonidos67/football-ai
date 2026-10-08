disk_free = float(input("Свободно ГБ: "))
threshold = 10.0

if disk_free < threshold:
    print("Warning: low disk.")

print("Проверка завершена.")