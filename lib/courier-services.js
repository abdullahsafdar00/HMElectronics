import axios from 'axios';

export class CourierService {
  constructor() {
    this.tcsConfig = {
      baseURL: process.env.TCS_API_URL || 'https://tcs.com.pk',
      apiKey: process.env.TCS_API_KEY,
      username: process.env.TCS_USERNAME,
      password: process.env.TCS_PASSWORD
    };
    
    this.mpConfig = {
      baseURL: process.env.MP_API_URL || 'https://mpexpress.com',
      apiKey: process.env.MP_API_KEY,
      merchantId: process.env.MP_MERCHANT_ID
    };
  }

  // FIX: Accept standardized structured properties to decouple from plain text Mongoose fields
  async bookTCSShipment({ customerName, shippingAddress, city, phone, totalAmount, itemSummary, weight }) {
    try {
      const shipmentData = {
        consignee_name: customerName,
        consignee_address: shippingAddress,
        consignee_phone: phone,
        consignee_city: city,
        pieces: 1,
        weight: weight || 1,
        cod_amount: totalAmount, // Will be 0 if prepaid via JazzCash
        service_type: 'O',
        product_details: itemSummary || 'HM Electronics E-Store Purchase'
      };

      const response = await axios.post(`${this.tcsConfig.baseURL}/shipments`, shipmentData, {
        headers: {
          'Authorization': `Bearer ${this.tcsConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        trackingNumber: response.data?.tracking_number || `TCS-${Date.now()}`,
        courierResponse: response.data
      };
    } catch (error) {
      console.error('TCS Booking Error:', error);
      return {
        success: false,
        error: error.message,
        trackingNumber: `TCS-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      };
    }
  }

  async bookMPShipment({ customerName, shippingAddress, city, phone, totalAmount, itemSummary, weight }) {
    try {
      const shipmentData = {
        merchant_id: this.mpConfig.merchantId,
        consignee_name: customerName,
        consignee_address: shippingAddress,
        consignee_phone: phone,
        consignee_city_id: this.getCityId(city),
        pieces: 1,
        weight: weight || 1,
        cod_amount: totalAmount, // Will be 0 if prepaid via JazzCash
        service_type: 'Normal',
        product_details: itemSummary || 'HM Electronics E-Store Purchase'
      };

      const response = await axios.post(`${this.mpConfig.baseURL}/book-packet`, shipmentData, {
        headers: {
          'Authorization': `Bearer ${this.mpConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        trackingNumber: response.data?.tracking_number || `MP-${Date.now()}`,
        courierResponse: response.data
      };
    } catch (error) {
      console.error('M&P Booking Error:', error);
      return {
        success: false,
        error: error.message,
        trackingNumber: `MP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      };
    }
  }

  async trackShipment(trackingNumber, courier) {
    try {
      let response;
      if (courier === 'tcs') {
        response = await axios.get(`${this.tcsConfig.baseURL}/track/${trackingNumber}`, {
          headers: { 'Authorization': `Bearer ${this.tcsConfig.apiKey}` }
        });
      } else if (courier === 'mnp') {
        response = await axios.get(`${this.mpConfig.baseURL}/track/${trackingNumber}`, {
          headers: { 'Authorization': `Bearer ${this.mpConfig.apiKey}` }
        });
      }

      return {
        success: true,
        status: response?.data?.status || 'In Transit',
        currentLocation: response?.data?.current_location || 'Sorting Hub', // FIXED location keyword bug
        history: response?.data?.tracking_history || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'In Transit'
      };
    }
  }

  getCityId(cityName) {
    if (!cityName) return 1;
    const cityMap = {
      'karachi': 1,
      'lahore': 2,
      'islamabad': 3,
      'rawalpindi': 4,
      'faisalabad': 5,
      'multan': 6,
      'peshawar': 7,
      'quetta': 8
    };
    return cityMap[cityName.toLowerCase()] || 1;
  }

  calculateTCSRate(fromCity, toCity, weight) {
    const baseRate = 250;
    const weightMultiplier = weight > 1 ? (weight - 1) * 50 : 0;
    return baseRate + weightMultiplier;
  }

  calculateMPRate(fromCity, toCity, weight) {
    const baseRate = 230;
    const weightMultiplier = weight > 1 ? (weight - 1) * 45 : 0;
    return baseRate + weightMultiplier;
  }
}

export default new CourierService();
