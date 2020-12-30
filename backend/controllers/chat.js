const Chat = require('../models/chat')
const jwt = require('jsonwebtoken')
const { secret } = require('../config/environment')

function getChat(req, res) {
  Chat
    .find()

    .then(chat => {
      res.send(chat)
    })
    .catch(error => res.send(error))
}

function postMessage(req, res) {

  Chat
    .findOne({ region: req.body.region })

    .then(region => {

      region.messages.push(req.body)

      res.send(region)
      region.save()
    })
    .catch(error => res.send(error))
}

function createUser(req, res) {
  const body = req.body

  User
    .create(body)
    .then(user => {

      res.send(user)
    })
    .catch(error => res.send(error))
}

function singleUser(req, res) {
  const accountId = req.params
  const finalId = accountId.accountId
  console.log(finalId)
  User
    .findById(finalId)
    //.findById(accountId)
    .then(account => {
      console.log(account)
      console.log('123')

      if (!account) return res.status(404).send({ message: 'User not found' })
      res.send(account)

    })
    .catch(error => res.send(error))
}


function removeUser(req, res) {
  const accountId = req.params
  const finalId = accountId.accountId
  const currentUser = req.currentUser

  User
    .findById(finalId)
    .then(account => {
      if (!account._id.equals(currentUser._id) && !req.currentUser.isAdmin) {
        return res.status(401).send({ message: 'Unauthorised' })
      }
      account.deleteOne()
      res.send(account)
    })
    .catch(error => res.send(error))
}

function modifyUser(req, res) {
  const accountId = req.params
  const finalId = accountId.accountId
  const body = req.body

  const currentUser = req.currentUser

  User
    .findById(finalId)
    .then(account => {
      if (!account) return res.send({ message: 'No user by this name' })
      if (!account._id.equals(currentUser._id)) {
        return res.status(401).send({ message: 'Unauthorised' })
      }
      account.set(body)
      console.log(body)
      //account.save()
      //res.send(account)
      return account.save()
    })
    .then(account => res.send(account))
    .catch(error => res.send(error))
}

function logInUser(req, res) {
  console.log(req.body)
  User
    .findOne({ email: req.body.email })
    .then(user => {

      if (!user) {
        res.send({ message: 'User not found' })

        return
      }

      if (!user.validatePassword(req.body.password)) {
        res.send({ message: 'Incorrect password' })

        return
      }

      const token = jwt.sign(
        { sub: user._id },
        secret,
        { expiresIn: '6h' }
      )
      res.status(202).send({ token })

    })

    .catch(error => res.send(error))

}

function addToFavourites(req, res) {

  const favourite = req.body
  console.log(favourite)

  const name = req.currentUser._id

  User
    .findById(name)

    .then(user => {
      console.log('555')

      if (!user) return res.status(404).send({ message: 'User not found' })

      console.log(user)


      const internalfavourite = favourite.favourite

      const containsFavourite = user.favourites.includes(internalfavourite)

      if (containsFavourite) {
        console.log('already here')
        return res.send({ message: `${internalfavourite} is already in your destinations!` })


      } else if (!containsFavourite) {
        user.favourites.push(favourite.favourite)

      }


      console.log(containsFavourite)
      console.log(internalfavourite)
      return user.save()
    })

    .then(user => res.send(user))
    .catch(err => res.send(err))
}

function deleteFromFavourites(req, res) {

  const favourite = req.params.favouritename
  console.log(favourite)

  const name = req.currentUser._id

  User
    .findById(name)

    .then(user => {

      if (!user) return res.status(404).send({ message: 'User not found' })

      const newfilter = []

      for (let i = 0; i < user.favourites.length; i++) {
        const item = user.favourites

        if (item[i] === favourite) {
          console.log('same')

        } else if (item[i] !== favourite) {
          console.log('not same')
          newfilter.push(user.favourites[i])

        } else {
          console.log('nothing')
        }

      }

      console.log(user.favourites)

      const favourites = user.favourites

      favourites.splice(0, favourites.length)

      newfilter.forEach((favourite) => {
        favourites.push(favourite)
      })

      return user.save()
    })

    .then(user => res.send(user))
    .catch(err => res.send(err))
}

module.exports = {
  getChat,
  postMessage,
  createUser,
  logInUser,
  singleUser,
  removeUser,
  modifyUser,
  addToFavourites,
  deleteFromFavourites
}