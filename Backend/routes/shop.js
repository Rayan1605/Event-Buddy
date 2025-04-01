const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  ourId: { type: String, required: true },
  anArray: { type: Array, required: false },
  anObject: { type: Object, required: false }
})

const Product = mongoose.model('product', productSchema) // 'product' refers to the collection, so maps products collection to productSchema; see lecture notes

let nextProductId = 0
router.get('/addProduct', (req, res, next) => {
  new Product({ ourId: '9' + nextProductId, name: 'widget', price: 3.95, size: 'large' })
    .save()
    .then(result => {
      nextProductId++
      console.log('saved product to database')
      res.redirect('/')
    })
    .catch(err => {
      console.log('failed to addAproduct: ' + err)
      res.redirect('/')
    })
})

router.get('/', (req, res, next) => {
  console.log(req.query)
  Product.find() // Always returns an array
    .then(products => {
      res.send(JSON.stringify(products))
    })
    .catch(err => {
      console.log('Failed to find: ' + err)
      res.send(JSON.stringify(err))
    })
})

router.post('/', (req, res, next) => {
  console.log(req.body)
  Product.find() // Always returns an array
    .then(products => {
      res.json({ success: true, Products: products })
    })
    .catch(err => {
      console.log('Failed to find: ' + err)
      res.json({ success: false, theError: err })
    })
})

router.get('/getSpecificProduct', (req, res, next) => {
  Product.find({ ourId: req.query.ourId }) // Always returns an array
    .then(products => {
      res.send(JSON.stringify(products[0]))
    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.send(JSON.stringify(err))
    })
})

router.post('/getSpecificProduct', (req, res, next) => {
  Product.find({ ourId: req.body.ourId }) // Always returns an array
    .then(products => {
      res.json({ success: true, theProduct: products[0] })
    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.json({ success: false, theError: err })
    })
})

router.get('/updateSpecificProduct', (req, res, next) => {
  Product.find({ ourId: '1' }) // Always returns an array
    .then(products => {
      let specificProduct = products[0] // pick the first match
      specificProduct.price = 199.95
      specificProduct.save() // Should check for errors here too
      res.redirect('/')
    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.send('No product found')
    })
})

router.get('/deleteSpecificProduct', (req, res, next) => {
  Product.findOneAndRemove({ ourId: '0' })
    .then(resp => {
      res.redirect('/')
    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.send('No product found')
    })
})

exports.routes = router
