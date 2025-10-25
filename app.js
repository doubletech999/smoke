/* ===================================
   المتغيرات العامة والعناصر
   =================================== */

// مصفوفات لحفظ البيانات
let morningData = [];
let eveningData = [];

// عناصر الصباح
const morningForm = document.getElementById('morningForm');
const morningBrand = document.getElementById('morningBrand');
const morningType = document.getElementById('morningType');
const morningQuantity = document.getElementById('morningQuantity');
const morningBody = document.getElementById('morningBody');
const morningEmptyMessage = document.getElementById('morningEmptyMessage');
const morningTotalElement = document.getElementById('morningTotal');

// عناصر المساء
const eveningForm = document.getElementById('eveningForm');
const eveningBrand = document.getElementById('eveningBrand');
const eveningType = document.getElementById('eveningType');
const eveningQuantity = document.getElementById('eveningQuantity');
const eveningBody = document.getElementById('eveningBody');
const eveningEmptyMessage = document.getElementById('eveningEmptyMessage');
const eveningTotalElement = document.getElementById('eveningTotal');

// العناصر المشتركة
const currentDateElement = document.getElementById('currentDate');
const totalsSection = document.getElementById('totalsSection');

// أزرار الإجراءات
const exportBtn = document.getElementById('exportBtn');
const printBtn = document.getElementById('printBtn');
const resetBtn = document.getElementById('resetBtn');

/* ===================================
   تهيئة التطبيق عند التحميل
   =================================== */
document.addEventListener('DOMContentLoaded', function() {
    // عرض التاريخ الحالي
    displayCurrentDate();
    
    // تحميل البيانات من LocalStorage
    loadDataFromStorage();
    
    // عرض البيانات في الجداول
    renderTables();
    
    // إضافة مستمعي الأحداث
    attachEventListeners();
});

/* ===================================
   عرض التاريخ الحالي
   =================================== */
function displayCurrentDate() {
    const today = new Date();
    
    // الحصول على اسم اليوم بالعربية
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = days[today.getDay()];
    
    // الحصول على اسم الشهر بالعربية
    const months = [
        'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthName = months[today.getMonth()];
    
    // تنسيق التاريخ
    const day = today.getDate();
    const year = today.getFullYear();
    
    // عرض التاريخ بالصيغة: يوم الأحد، 25 أكتوبر 2025
    const formattedDate = `${dayName}، ${day} ${monthName} ${year}`;
    currentDateElement.textContent = formattedDate;
}

/* ===================================
   تحميل البيانات من LocalStorage
   =================================== */
function loadDataFromStorage() {
    const savedMorningData = localStorage.getItem('morningData');
    const savedEveningData = localStorage.getItem('eveningData');
    
    if (savedMorningData) {
        morningData = JSON.parse(savedMorningData);
    }
    if (savedEveningData) {
        eveningData = JSON.parse(savedEveningData);
    }
}

/* ===================================
   حفظ البيانات في LocalStorage
   =================================== */
function saveDataToStorage() {
    localStorage.setItem('morningData', JSON.stringify(morningData));
    localStorage.setItem('eveningData', JSON.stringify(eveningData));
}

/* ===================================
   إضافة مستمعي الأحداث
   =================================== */
function attachEventListeners() {
    // إضافة منتج صباح
    morningForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addNewItem('morning');
    });
    
    // إضافة منتج مساء
    eveningForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addNewItem('evening');
    });
    
    // تصدير Excel
    exportBtn.addEventListener('click', exportToExcel);
    
    // طباعة
    printBtn.addEventListener('click', printInventory);
    
    // إعادة الضبط
    resetBtn.addEventListener('click', resetInventory);
    
    // منع الأرقام السالبة
    morningQuantity.addEventListener('input', function() {
        if (this.value < 0) this.value = 0;
    });
    
    eveningQuantity.addEventListener('input', function() {
        if (this.value < 0) this.value = 0;
    });
}

/* ===================================
   إضافة منتج جديد
   =================================== */
function addNewItem(period) {
    let brand, type, quantity, form;
    
    if (period === 'morning') {
        brand = morningBrand.value.trim();
        type = morningType.value.trim();
        quantity = parseInt(morningQuantity.value) || 0;
        form = morningForm;
    } else {
        brand = eveningBrand.value.trim();
        type = eveningType.value.trim();
        quantity = parseInt(eveningQuantity.value) || 0;
        form = eveningForm;
    }
    
    // التحقق من البيانات
    if (!brand) {
        alert('⚠️ الرجاء اختيار العلامة التجارية');
        return;
    }
    
    if (quantity < 0) {
        alert('⚠️ لا يمكن إدخال أرقام سالبة');
        return;
    }
    
    // إنشاء كائن المنتج
    const item = {
        id: Date.now(),
        brand: brand,
        type: type,
        quantity: quantity
    };
    
    // إضافة للمصفوفة المناسبة
    if (period === 'morning') {
        morningData.push(item);
    } else {
        eveningData.push(item);
    }
    
    // حفظ في LocalStorage
    saveDataToStorage();
    
    // تحديث الجداول
    renderTables();
    
    // إعادة ضبط النموذج
    form.reset();
    
    if (period === 'morning') {
        morningBrand.focus();
    } else {
        eveningBrand.focus();
    }
}

/* ===================================
   عرض البيانات في الجداول
   =================================== */
function renderTables() {
    renderTable('morning');
    renderTable('evening');
    updateTotals();
}

function renderTable(period) {
    let data, tbody, emptyMessage;
    
    if (period === 'morning') {
        data = morningData;
        tbody = morningBody;
        emptyMessage = morningEmptyMessage;
    } else {
        data = eveningData;
        tbody = eveningBody;
        emptyMessage = eveningEmptyMessage;
    }
    
    // مسح الجدول
    tbody.innerHTML = '';
    
    // التحقق من وجود بيانات
    if (data.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    // إضافة كل صف
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.brand}</strong></td>
            <td>${item.type || '-'}</td>
            <td><strong>${item.quantity}</strong></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editItem('${period}', ${item.id})">
                        ✏️ تعديل
                    </button>
                    <button class="btn btn-delete" onclick="deleteItem('${period}', ${item.id})">
                        🗑️ حذف
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/* ===================================
   تعديل منتج
   =================================== */
function editItem(period, id) {
    let data, brandSelect, typeInput, quantityInput;
    
    if (period === 'morning') {
        data = morningData;
        brandSelect = morningBrand;
        typeInput = morningType;
        quantityInput = morningQuantity;
    } else {
        data = eveningData;
        brandSelect = eveningBrand;
        typeInput = eveningType;
        quantityInput = eveningQuantity;
    }
    
    // البحث عن المنتج
    const item = data.find(i => i.id === id);
    if (!item) return;
    
    // ملء النموذج بالبيانات
    brandSelect.value = item.brand;
    typeInput.value = item.type;
    quantityInput.value = item.quantity;
    
    // حذف المنتج القديم
    deleteItem(period, id, false);
    
    // التركيز على القسم المناسب
    if (period === 'morning') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        eveningForm.scrollIntoView({ behavior: 'smooth' });
    }
}

/* ===================================
   حذف منتج
   =================================== */
function deleteItem(period, id, confirm = true) {
    // طلب التأكيد
    if (confirm && !window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        return;
    }
    
    // حذف المنتج
    if (period === 'morning') {
        morningData = morningData.filter(item => item.id !== id);
    } else {
        eveningData = eveningData.filter(item => item.id !== id);
    }
    
    // حفظ وتحديث
    saveDataToStorage();
    renderTables();
}

/* ===================================
   تحديث الإجماليات
   =================================== */
function updateTotals() {
    // حساب مجموع الصباح
    const morningTotal = morningData.reduce((sum, item) => sum + item.quantity, 0);
    morningTotalElement.textContent = morningTotal;
    
    // حساب مجموع المساء
    const eveningTotal = eveningData.reduce((sum, item) => sum + item.quantity, 0);
    eveningTotalElement.textContent = eveningTotal;
    
    // حساب الإجمالي الكلي
    const grandTotal = morningTotal + eveningTotal;
    
    // تحديث قسم الإجماليات
    if (morningData.length > 0 || eveningData.length > 0) {
        totalsSection.style.display = 'block';
        
        // تحديث الإجماليات العامة
        document.getElementById('totalMorning').textContent = morningTotal;
        document.getElementById('totalEvening').textContent = eveningTotal;
        document.getElementById('grandTotal').textContent = grandTotal;
        
        // تحديث ملخص البراندات
        updateBrandSummary();
    } else {
        totalsSection.style.display = 'none';
    }
}

/* ===================================
   تحديث ملخص البراندات
   =================================== */
function updateBrandSummary() {
    const brandTotals = {};
    
    // جمع البيانات من الصباح
    morningData.forEach(item => {
        if (!brandTotals[item.brand]) {
            brandTotals[item.brand] = { morning: 0, evening: 0, total: 0 };
        }
        brandTotals[item.brand].morning += item.quantity;
        brandTotals[item.brand].total += item.quantity;
    });
    
    // جمع البيانات من المساء
    eveningData.forEach(item => {
        if (!brandTotals[item.brand]) {
            brandTotals[item.brand] = { morning: 0, evening: 0, total: 0 };
        }
        brandTotals[item.brand].evening += item.quantity;
        brandTotals[item.brand].total += item.quantity;
    });
    
    // عرض الملخص
    const brandSummary = document.getElementById('brandSummary');
    brandSummary.innerHTML = '';
    
    Object.keys(brandTotals).sort().forEach(brand => {
        const item = document.createElement('div');
        item.className = 'brand-item';
        item.innerHTML = `
            <span class="brand-name">${brand}</span>
            <span class="brand-total">
                صباحًا: ${brandTotals[brand].morning} | 
                مساءً: ${brandTotals[brand].evening} | 
                المجموع: ${brandTotals[brand].total}
            </span>
        `;
        brandSummary.appendChild(item);
    });
}

/* ===================================
   تصدير إلى Excel
   =================================== */
function exportToExcel() {
    // التحقق من وجود بيانات
    if (morningData.length === 0 && eveningData.length === 0) {
        alert('⚠️ لا توجد بيانات للتصدير!');
        return;
    }
    
    // إعداد البيانات
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    // تنسيق التاريخ
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    // إنشاء ورقة العمل
    const worksheetData = [];
    
    // الصف الأول: التاريخ (دمج الخلايا)
    worksheetData.push([formattedDate]);
    
    // الصف الثاني: العناوين
    worksheetData.push(['', '', 'صباح/مساء']);
    
    // الصف الثالث: رؤوس الأعمدة
    worksheetData.push(['', '', 'صباحا', 'مساءً']);
    
    // جمع كل البراندات الفريدة
    const allBrands = new Set();
    morningData.forEach(item => allBrands.add(item.brand));
    eveningData.forEach(item => allBrands.add(item.brand));
    
    // ترتيب البراندات حسب القائمة الأصلية
    const brandOrder = [
        'إمبريال',
        'ديفيدوف (جميع أنواعه)',
        'مالبورو (جميع أنواعه)',
        'وينستون (جميع أنواعه)',
        'أل ام (جميع أنواعه)',
        'بارليمنت (جميع أنواعه)',
        'بلاك مور (مشكل)',
        'جلواز مشكل',
        'Terea مشكل',
        'دخان كاميل',
        'دخان كورست سلم',
        'دخان كابيتال'
    ];
    
    const sortedBrands = [...allBrands].sort((a, b) => {
        const indexA = brandOrder.indexOf(a);
        const indexB = brandOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'ar');
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
    
    // حساب الإجماليات لكل براند
    const brandTotals = {};
    sortedBrands.forEach(brand => {
        const morningItems = morningData.filter(item => item.brand === brand);
        const eveningItems = eveningData.filter(item => item.brand === brand);
        
        const morningTotal = morningItems.reduce((sum, item) => sum + item.quantity, 0);
        const eveningTotal = eveningItems.reduce((sum, item) => sum + item.quantity, 0);
        
        brandTotals[brand] = {
            morning: morningTotal,
            evening: eveningTotal
        };
    });
    
    // إضافة صفوف البيانات
    let rowNumber = 1;
    sortedBrands.forEach(brand => {
        worksheetData.push([
            rowNumber,
            `دخان ${brand}`,
            brandTotals[brand].morning || '',
            brandTotals[brand].evening || ''
        ]);
        rowNumber++;
    });
    
    // إنشاء ورقة العمل
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // دمج الخلايا للتاريخ (A1:D1)
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });
    
    // دمج الخلايا لـ "صباح/مساء" (C2:D2)
    worksheet['!merges'].push({ s: { r: 1, c: 2 }, e: { r: 1, c: 3 } });
    
    // تنسيق عرض الأعمدة
    worksheet['!cols'] = [
        { wch: 5 },   // # رقم
        { wch: 35 },  // اسم الدخان
        { wch: 12 },  // صباحا
        { wch: 12 }   // مساءً
    ];
    
    // تطبيق التنسيقات على الخلايا
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellAddress]) continue;
            
            // تنسيق عام لكل الخلايا
            worksheet[cellAddress].s = {
                alignment: { 
                    horizontal: 'center', 
                    vertical: 'center',
                    wrapText: true 
                },
                border: {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } }
                },
                font: { 
                    name: 'Arial',
                    sz: 11,
                    bold: false
                }
            };
            
            // تنسيق صف التاريخ (الصف الأول)
            if (R === 0) {
                worksheet[cellAddress].s.fill = {
                    fgColor: { rgb: '808000' } // لون أخضر زيتوني
                };
                worksheet[cellAddress].s.font = {
                    name: 'Arial',
                    sz: 12,
                    bold: true,
                    color: { rgb: 'FFFFFF' }
                };
            }
            
            // تنسيق صف "صباح/مساء" (الصف الثاني)
            if (R === 1) {
                worksheet[cellAddress].s.fill = {
                    fgColor: { rgb: 'D3D3D3' } // لون رمادي فاتح
                };
                worksheet[cellAddress].s.font = {
                    name: 'Arial',
                    sz: 11,
                    bold: true
                };
            }
            
            // تنسيق صف العناوين (الصف الثالث)
            if (R === 2) {
                worksheet[cellAddress].s.fill = {
                    fgColor: { rgb: 'D3D3D3' } // لون رمادي فاتح
                };
                worksheet[cellAddress].s.font = {
                    name: 'Arial',
                    sz: 11,
                    bold: true
                };
            }
            
            // تنسيق صفوف البيانات
            if (R > 2) {
                // العمود الأول (الأرقام) - أصفر
                if (C === 0) {
                    worksheet[cellAddress].s.fill = {
                        fgColor: { rgb: 'FFFF00' } // أصفر
                    };
                    worksheet[cellAddress].s.font = {
                        name: 'Arial',
                        sz: 11,
                        bold: true
                    };
                }
                // العمود الثاني (أسماء الدخان) - برتقالي
                else if (C === 1) {
                    worksheet[cellAddress].s.fill = {
                        fgColor: { rgb: 'FFA500' } // برتقالي
                    };
                    worksheet[cellAddress].s.alignment = {
                        horizontal: 'right',
                        vertical: 'center',
                        wrapText: true
                    };
                    worksheet[cellAddress].s.font = {
                        name: 'Arial',
                        sz: 11,
                        bold: false
                    };
                }
                // أعمدة البيانات (صباحا ومساءً) - رمادي فاتح
                else {
                    worksheet[cellAddress].s.fill = {
                        fgColor: { rgb: 'E8E8E8' } // رمادي فاتح جداً
                    };
                }
            }
        }
    }
    
    // إنشاء الكتاب
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'جرد الدخان');
    
    // تصدير الملف
    const fileName = `جرد الدخان - ${dateString}.xlsx`;
    XLSX.writeFile(workbook, fileName, { cellStyles: true });
    
    alert('✅ تم تصدير الملف بنجاح!');
}

/* ===================================
   طباعة الجرد
   =================================== */
function printInventory() {
    // التحقق من وجود بيانات
    if (morningData.length === 0 && eveningData.length === 0) {
        alert('⚠️ لا توجد بيانات للطباعة!');
        return;
    }
    
    window.print();
}

/* ===================================
   إعادة ضبط اليوم
   =================================== */
function resetInventory() {
    // طلب التأكيد
    const confirmed = confirm(
        '⚠️ تحذير!\n\n' +
        'هل أنت متأكد من حذف جميع البيانات؟\n' +
        'لن يمكن استرجاع البيانات بعد الحذف.\n\n' +
        'يُنصح بتصدير البيانات إلى Excel قبل الحذف.'
    );
    
    if (!confirmed) return;
    
    // مسح البيانات
    morningData = [];
    eveningData = [];
    
    // حفظ وتحديث
    saveDataToStorage();
    renderTables();
    
    // إعادة ضبط النماذج
    morningForm.reset();
    eveningForm.reset();
    
    alert('✅ تم إعادة ضبط البيانات بنجاح!');
}

/* ===================================
   حفظ تلقائي عند تغيير البيانات
   =================================== */
window.addEventListener('beforeunload', function() {
    saveDataToStorage();
});