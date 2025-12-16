#!/usr/bin/env node

/**
 * Test script for the Image API
 * Run this script to test image URL generation and serving
 */

import { getImageUrl, appendBaseUrl } from './src/controllers/images/serveImage.js';

console.log('🧪 Testing Image API Functions\n');

// Test getImageUrl function
console.log('=== Testing getImageUrl() ===');

const testCases = [
    '/images/photo.jpg',
    'photo.jpg',
    'http://localhost:3000/images/photo.jpg',
    '/images/category-123.jpg',
    null,
    ''
];

testCases.forEach((testCase, index) => {
    const result = getImageUrl(testCase);
    console.log(`Test ${index + 1}:`);
    console.log(`  Input:  "${testCase}"`);
    console.log(`  Output: "${result}"`);
    console.log('');
});

// Test appendBaseUrl function
console.log('=== Testing appendBaseUrl() ===');

// Test with single object
const singleObject = {
    name: 'Food Category',
    image: '/images/food.jpg',
    description: 'Delicious food items'
};

console.log('Single Object Test:');
console.log('  Input:', JSON.stringify(singleObject, null, 2));
const singleResult = appendBaseUrl(singleObject);
console.log('  Output:', JSON.stringify(singleResult, null, 2));
console.log('');

// Test with nested object
const nestedObject = {
    offer_title: '50% OFF Pizza',
    OfferImage: {
        image: '/images/pizza-offer.jpg'
    },
    price: 100
};

console.log('Nested Object Test:');
console.log('  Input:', JSON.stringify(nestedObject, null, 2));
const nestedResult = appendBaseUrl(nestedObject);
console.log('  Output:', JSON.stringify(nestedResult, null, 2));
console.log('');

// Test with array
const arrayObject = [
    { name: 'Pizza', image: '/images/pizza.jpg' },
    { name: 'Burger', image: '/images/burger.jpg' },
    { name: 'Salad', image: null }
];

console.log('Array Test:');
console.log('  Input:', JSON.stringify(arrayObject, null, 2));
const arrayResult = appendBaseUrl(arrayObject);
console.log('  Output:', JSON.stringify(arrayResult, null, 2));
console.log('');

// Test URL accessibility simulation
console.log('=== URL Accessibility Test ===');
const imageUrl = getImageUrl('/images/test-image.jpg');
console.log(`Generated URL: ${imageUrl}`);
console.log('You can test this URL in your browser to verify it works correctly.');
console.log('');

console.log('✅ Image API test completed successfully!');