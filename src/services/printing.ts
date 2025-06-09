// Professional printing and reporting utilities with multi-language support
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { formatCurrencyByLanguage, formatDateByLanguage, isRTL } from '@/i18n'
import type { Order } from '@/stores/orders'
import type { Product } from '@/stores/products'

// Arabic font support for jsPDF
const ARABIC_FONT_URL = '/fonts/NotoSansArabic-Regular.ttf'

export interface CompanyInfo {
  name: string
  name_ar?: string
  name_fr?: string
  name_nl?: string
  logo_url?: string
  address: string
  address_ar?: string
  address_fr?: string
  address_nl?: string
  phone: string
  email: string
  website?: string
  tax_number?: string
  registration_number?: string
}

export interface PrintOptions {
  language: string
  currency: string
  includeHeader: boolean
  includeFooter: boolean
  watermark?: string
}

export class PrintingService {
  private static instance: PrintingService
  private arabicFontLoaded = false

  static getInstance(): PrintingService {
    if (!PrintingService.instance) {
      PrintingService.instance = new PrintingService()
    }
    return PrintingService.instance
  }

  /**
   * Load Arabic font for PDF generation
   */
  private async loadArabicFont(): Promise<void> {
    if (this.arabicFontLoaded) return

    try {
      const response = await fetch(ARABIC_FONT_URL)
      const fontData = await response.arrayBuffer()
      const base64Font = btoa(String.fromCharCode(...new Uint8Array(fontData)))
      
      // This would be added to jsPDF font registry
      this.arabicFontLoaded = true
    } catch (error) {
      console.warn('Could not load Arabic font:', error)
    }
  }

  /**
   * Generate professional invoice PDF
   */
  async generateInvoice(
    order: Order,
    companyInfo: CompanyInfo,
    options: PrintOptions
  ): Promise<Blob> {
    const { language, currency } = options
    const isRtl = isRTL(language)

    // Load Arabic font if needed
    if (language === 'ar') {
      await this.loadArabicFont()
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Set font based on language
    if (language === 'ar' && this.arabicFontLoaded) {
      doc.addFont(ARABIC_FONT_URL, 'NotoSansArabic', 'normal')
      doc.setFont('NotoSansArabic')
    } else {
      doc.setFont('helvetica')
    }

    // Set text direction
    if (isRtl) {
      doc.setR2L(true)
    }

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20

    let yPosition = margin

    // Header with company logo and info
    if (options.includeHeader) {
      yPosition = this.addInvoiceHeader(doc, companyInfo, options, yPosition, pageWidth, margin)
    }

    // Invoice title and details
    yPosition = this.addInvoiceTitle(doc, order, options, yPosition, pageWidth, margin)

    // Customer information
    yPosition = this.addCustomerInfo(doc, order, options, yPosition, pageWidth, margin)

    // Order items table
    yPosition = this.addOrderItemsTable(doc, order, options, yPosition, pageWidth, margin)

    // Totals section
    yPosition = this.addOrderTotals(doc, order, options, yPosition, pageWidth, margin)

    // Footer
    if (options.includeFooter) {
      this.addInvoiceFooter(doc, companyInfo, options, pageHeight, pageWidth, margin)
    }

    // Watermark
    if (options.watermark) {
      this.addWatermark(doc, options.watermark, pageWidth, pageHeight)
    }

    return doc.output('blob')
  }

  /**
   * Add invoice header with company info and logo
   */
  private addInvoiceHeader(
    doc: jsPDF,
    companyInfo: CompanyInfo,
    options: PrintOptions,
    yPosition: number,
    pageWidth: number,
    margin: number
  ): number {
    const { language } = options
    const isRtl = isRTL(language)

    // Company logo
    if (companyInfo.logo_url) {
      try {
        const logoWidth = 30
        const logoHeight = 20
        const logoX = isRtl ? pageWidth - margin - logoWidth : margin
        
        // Note: In real implementation, you'd load and add the image
        doc.rect(logoX, yPosition, logoWidth, logoHeight)
        doc.setFontSize(8)
        doc.text('LOGO', logoX + logoWidth/2, yPosition + logoHeight/2, { align: 'center' })
      } catch (error) {
        console.warn('Could not load company logo:', error)
      }
    }

    // Company name and details
    const textX = isRtl ? pageWidth - margin - 80 : margin + 40
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    
    const companyName = this.getLocalizedText(companyInfo, 'name', language)
    doc.text(companyName, textX, yPosition + 8)

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    
    const companyAddress = this.getLocalizedText(companyInfo, 'address', language)
    doc.text(companyAddress, textX, yPosition + 15)
    
    if (companyInfo.phone) {
      doc.text(`${this.getLabel('phone', language)}: ${companyInfo.phone}`, textX, yPosition + 22)
    }
    
    if (companyInfo.email) {
      doc.text(`${this.getLabel('email', language)}: ${companyInfo.email}`, textX, yPosition + 29)
    }

    return yPosition + 45
  }

  /**
   * Add invoice title and order details
   */
  private addInvoiceTitle(
    doc: jsPDF,
    order: Order,
    options: PrintOptions,
    yPosition: number,
    pageWidth: number,
    margin: number
  ): number {
    const { language, currency } = options
    const isRtl = isRTL(language)

    // Invoice title
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    const title = this.getLabel('invoice', language)
    const titleX = isRtl ? pageWidth - margin : margin
    doc.text(title, titleX, yPosition, { align: isRtl ? 'right' : 'left' })

    yPosition += 15

    // Order details in two columns
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    const leftX = margin
    const rightX = pageWidth - margin - 60

    // Left column
    doc.text(`${this.getLabel('order_number', language)}: #${order.id}`, leftX, yPosition)
    doc.text(`${this.getLabel('order_date', language)}: ${formatDateByLanguage(order.created_at, language)}`, leftX, yPosition + 7)
    
    if (order.sales_rep) {
      doc.text(`${this.getLabel('sales_rep', language)}: ${order.sales_rep.name}`, leftX, yPosition + 14)
    }

    // Right column
    const statusLabel = this.getLabel('status', language)
    const statusText = this.getLabel(`status_${order.status}`, language)
    doc.text(`${statusLabel}: ${statusText}`, rightX, yPosition)

    return yPosition + 25
  }

  /**
   * Add customer information
   */
  private addCustomerInfo(
    doc: jsPDF,
    order: Order,
    options: PrintOptions,
    yPosition: number,
    pageWidth: number,
    margin: number
  ): number {
    const { language } = options
    const isRtl = isRTL(language)

    // Customer section title
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    const customerTitle = this.getLabel('customer_info', language)
    doc.text(customerTitle, margin, yPosition)

    yPosition += 10

    // Customer details
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    doc.text(`${this.getLabel('customer_name', language)}: ${order.customer_name}`, margin, yPosition)
    
    if (order.customer_phone) {
      doc.text(`${this.getLabel('customer_phone', language)}: ${order.customer_phone}`, margin, yPosition + 7)
    }
    
    if (order.customer_address) {
      doc.text(`${this.getLabel('customer_address', language)}: ${order.customer_address}`, margin, yPosition + 14)
    }

    return yPosition + 25
  }

  /**
   * Add order items table
   */
  private addOrderItemsTable(
    doc: jsPDF,
    order: Order,
    options: PrintOptions,
    yPosition: number,
    pageWidth: number,
    margin: number
  ): number {
    const { language, currency } = options
    const isRtl = isRTL(language)

    // Table headers
    const headers = [
      this.getLabel('item_name', language),
      this.getLabel('quantity', language),
      this.getLabel('unit_price', language),
      this.getLabel('total', language)
    ]

    if (isRtl) {
      headers.reverse()
    }

    // Table data
    const tableData = order.order_products.map(item => {
      const row = [
        item.name + (item.description ? `\n${item.description}` : ''),
        item.quantity.toString(),
        formatCurrencyByLanguage(item.unit_price, currency, language),
        formatCurrencyByLanguage(item.subtotal, currency, language)
      ]
      
      return isRtl ? row.reverse() : row
    })

    // Generate table using autoTable plugin
    ;(doc as any).autoTable({
      startY: yPosition,
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [128, 128, 128],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: isRtl ? {
        0: { halign: 'right' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      } : {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      margin: { left: margin, right: margin }
    })

    return (doc as any).lastAutoTable.finalY + 10
  }

  /**
   * Add order totals section
   */
  private addOrderTotals(
    doc: jsPDF,
    order: Order,
    options: PrintOptions,
    yPosition: number,
    pageWidth: number,
    margin: number
  ): number {
    const { language, currency } = options
    const isRtl = isRTL(language)

    const totalsX = pageWidth - margin - 80
    const labelX = totalsX
    const valueX = pageWidth - margin

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    // Subtotal
    const subtotalLabel = this.getLabel('subtotal', language)
    const subtotalValue = formatCurrencyByLanguage(order.subtotal, currency, language)
    doc.text(`${subtotalLabel}:`, labelX, yPosition, { align: 'left' })
    doc.text(subtotalValue, valueX, yPosition, { align: 'right' })

    yPosition += 7

    // Tax
    if (order.tax_amount > 0) {
      const taxLabel = `${this.getLabel('tax', language)} (${order.tax_rate}%)`
      const taxValue = formatCurrencyByLanguage(order.tax_amount, currency, language)
      doc.text(`${taxLabel}:`, labelX, yPosition, { align: 'left' })
      doc.text(taxValue, valueX, yPosition, { align: 'right' })
      yPosition += 7
    }

    // Total
    doc.setFont(undefined, 'bold')
    doc.setFontSize(12)
    const totalLabel = this.getLabel('total', language)
    const totalValue = formatCurrencyByLanguage(order.total, currency, language)
    doc.text(`${totalLabel}:`, labelX, yPosition, { align: 'left' })
    doc.text(totalValue, valueX, yPosition, { align: 'right' })

    // Notes
    if (order.notes) {
      yPosition += 15
      doc.setFont(undefined, 'normal')
      doc.setFontSize(10)
      doc.text(`${this.getLabel('notes', language)}:`, margin, yPosition)
      doc.text(order.notes, margin, yPosition + 7)
    }

    return yPosition + 20
  }

  /**
   * Add invoice footer
   */
  private addInvoiceFooter(
    doc: jsPDF,
    companyInfo: CompanyInfo,
    options: PrintOptions,
    pageHeight: number,
    pageWidth: number,
    margin: number
  ): void {
    const { language } = options
    const footerY = pageHeight - margin - 20

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(128, 128, 128)

    // Company registration info
    let footerText = ''
    if (companyInfo.tax_number) {
      footerText += `${this.getLabel('tax_number', language)}: ${companyInfo.tax_number}`
    }
    if (companyInfo.registration_number) {
      if (footerText) footerText += ' | '
      footerText += `${this.getLabel('registration_number', language)}: ${companyInfo.registration_number}`
    }

    if (footerText) {
      doc.text(footerText, pageWidth / 2, footerY, { align: 'center' })
    }

    // Website
    if (companyInfo.website) {
      doc.text(companyInfo.website, pageWidth / 2, footerY + 7, { align: 'center' })
    }

    // Thank you message
    const thankYouText = this.getLabel('thank_you', language)
    doc.text(thankYouText, pageWidth / 2, footerY + 14, { align: 'center' })
  }

  /**
   * Add watermark
   */
  private addWatermark(
    doc: jsPDF,
    watermarkText: string,
    pageWidth: number,
    pageHeight: number
  ): void {
    doc.setTextColor(200, 200, 200)
    doc.setFontSize(50)
    doc.setFont(undefined, 'bold')
    
    // Rotate and center the watermark
    const centerX = pageWidth / 2
    const centerY = pageHeight / 2
    
    doc.text(watermarkText, centerX, centerY, {
      align: 'center',
      angle: 45
    })
  }

  /**
   * Generate sales report PDF
   */
  async generateSalesReport(
    orders: Order[],
    products: Product[],
    companyInfo: CompanyInfo,
    options: PrintOptions & {
      dateRange: { start: string; end: string }
      groupBy: 'day' | 'week' | 'month'
    }
  ): Promise<Blob> {
    const { language, currency, dateRange } = options
    const isRtl = isRTL(language)

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Set font and direction
    if (language === 'ar' && this.arabicFontLoaded) {
      doc.addFont(ARABIC_FONT_URL, 'NotoSansArabic', 'normal')
      doc.setFont('NotoSansArabic')
    } else {
      doc.setFont('helvetica')
    }

    if (isRtl) {
      doc.setR2L(true)
    }

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = margin

    // Report header
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    const reportTitle = this.getLabel('sales_report', language)
    doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 15

    // Date range
    doc.setFontSize(12)
    doc.setFont(undefined, 'normal')
    const dateRangeText = `${formatDateByLanguage(dateRange.start, language)} - ${formatDateByLanguage(dateRange.end, language)}`
    doc.text(dateRangeText, pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 20

    // Summary statistics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const summaryData = [
      [this.getLabel('total_orders', language), totalOrders.toString()],
      [this.getLabel('total_revenue', language), formatCurrencyByLanguage(totalRevenue, currency, language)],
      [this.getLabel('average_order_value', language), formatCurrencyByLanguage(averageOrderValue, currency, language)]
    ]

    ;(doc as any).autoTable({
      startY: yPosition,
      head: [[this.getLabel('metric', language), this.getLabel('value', language)]],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [240, 240, 240] },
      margin: { left: margin, right: margin }
    })

    return doc.output('blob')
  }

  /**
   * Print invoice directly
   */
  async printInvoice(
    order: Order,
    companyInfo: CompanyInfo,
    options: PrintOptions
  ): Promise<void> {
    const pdfBlob = await this.generateInvoice(order, companyInfo, options)
    const pdfUrl = URL.createObjectURL(pdfBlob)
    
    // Open in new window for printing
    const printWindow = window.open(pdfUrl, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  /**
   * Get localized text from company info
   */
  private getLocalizedText(
    companyInfo: CompanyInfo,
    field: string,
    language: string
  ): string {
    const localizedField = `${field}_${language}`
    return (companyInfo as any)[localizedField] || (companyInfo as any)[field] || ''
  }

  /**
   * Get localized label
   */
  private getLabel(key: string, language: string): string {
    // This would use the i18n system
    const labels: Record<string, Record<string, string>> = {
      en: {
        invoice: 'INVOICE',
        order_number: 'Order Number',
        order_date: 'Order Date',
        sales_rep: 'Sales Representative',
        status: 'Status',
        customer_info: 'Customer Information',
        customer_name: 'Customer Name',
        customer_phone: 'Phone',
        customer_address: 'Address',
        item_name: 'Item',
        quantity: 'Qty',
        unit_price: 'Unit Price',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'Tax',
        notes: 'Notes',
        phone: 'Phone',
        email: 'Email',
        tax_number: 'Tax Number',
        registration_number: 'Registration Number',
        thank_you: 'Thank you for your business!',
        sales_report: 'Sales Report',
        total_orders: 'Total Orders',
        total_revenue: 'Total Revenue',
        average_order_value: 'Average Order Value',
        metric: 'Metric',
        value: 'Value',
        status_new: 'New',
        status_processing: 'Processing',
        status_completed: 'Completed',
        status_delivered: 'Delivered',
        status_cancelled: 'Cancelled'
      },
      ar: {
        invoice: 'فاتورة',
        order_number: 'رقم الطلب',
        order_date: 'تاريخ الطلب',
        sales_rep: 'مندوب المبيعات',
        status: 'الحالة',
        customer_info: 'معلومات العميل',
        customer_name: 'اسم العميل',
        customer_phone: 'الهاتف',
        customer_address: 'العنوان',
        item_name: 'الصنف',
        quantity: 'الكمية',
        unit_price: 'سعر الوحدة',
        total: 'الإجمالي',
        subtotal: 'المجموع الفرعي',
        tax: 'الضريبة',
        notes: 'ملاحظات',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        tax_number: 'الرقم الضريبي',
        registration_number: 'رقم التسجيل',
        thank_you: 'شكراً لتعاملكم معنا!',
        sales_report: 'تقرير المبيعات',
        total_orders: 'إجمالي الطلبات',
        total_revenue: 'إجمالي الإيرادات',
        average_order_value: 'متوسط قيمة الطلب',
        metric: 'المقياس',
        value: 'القيمة',
        status_new: 'جديد',
        status_processing: 'قيد المعالجة',
        status_completed: 'مكتمل',
        status_delivered: 'تم التسليم',
        status_cancelled: 'ملغي'
      },
      fr: {
        invoice: 'FACTURE',
        order_number: 'Numéro de commande',
        order_date: 'Date de commande',
        sales_rep: 'Représentant commercial',
        status: 'Statut',
        customer_info: 'Informations client',
        customer_name: 'Nom du client',
        customer_phone: 'Téléphone',
        customer_address: 'Adresse',
        item_name: 'Article',
        quantity: 'Qté',
        unit_price: 'Prix unitaire',
        total: 'Total',
        subtotal: 'Sous-total',
        tax: 'Taxe',
        notes: 'Notes',
        phone: 'Téléphone',
        email: 'Email',
        tax_number: 'Numéro de taxe',
        registration_number: 'Numéro d\'enregistrement',
        thank_you: 'Merci pour votre confiance!',
        sales_report: 'Rapport des ventes',
        total_orders: 'Total des commandes',
        total_revenue: 'Chiffre d\'affaires total',
        average_order_value: 'Valeur moyenne des commandes',
        metric: 'Métrique',
        value: 'Valeur',
        status_new: 'Nouveau',
        status_processing: 'En cours',
        status_completed: 'Terminé',
        status_delivered: 'Livré',
        status_cancelled: 'Annulé'
      },
      nl: {
        invoice: 'FACTUUR',
        order_number: 'Bestellingsnummer',
        order_date: 'Bestellingsdatum',
        sales_rep: 'Vertegenwoordiger',
        status: 'Status',
        customer_info: 'Klantinformatie',
        customer_name: 'Klantnaam',
        customer_phone: 'Telefoon',
        customer_address: 'Adres',
        item_name: 'Item',
        quantity: 'Aantal',
        unit_price: 'Eenheidsprijs',
        total: 'Totaal',
        subtotal: 'Subtotaal',
        tax: 'BTW',
        notes: 'Notities',
        phone: 'Telefoon',
        email: 'Email',
        tax_number: 'BTW-nummer',
        registration_number: 'Registratienummer',
        thank_you: 'Bedankt voor uw vertrouwen!',
        sales_report: 'Verkooprapport',
        total_orders: 'Totaal bestellingen',
        total_revenue: 'Totale omzet',
        average_order_value: 'Gemiddelde bestellingswaarde',
        metric: 'Metriek',
        value: 'Waarde',
        status_new: 'Nieuw',
        status_processing: 'In behandeling',
        status_completed: 'Voltooid',
        status_delivered: 'Geleverd',
        status_cancelled: 'Geannuleerd'
      }
    }

    return labels[language]?.[key] || labels.en[key] || key
  }
}

// Export singleton instance
export const printingService = PrintingService.getInstance()

