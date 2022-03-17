<script setup>

import {computed, ref} from "vue";
const allCategories = ['apple', 'banana', 'cat', 'dog', 'elephant', 'fish', 'giraffe', 'horse',
  'iguana', 'jungle', 'kangaroo', 'lion', 'monkey', 'newt', 'octopus', 'penguin', 'rose', 'snow', 'tiger', 'unicorn', 'violin', 'whale', 'xylophone', 'zebra']
const position = ref(0)
const audio = ref()
const audioSource = ref("/youawesome.m4a")

const NUM_CATEGORY = 3

const categories = ref([])
// const categories = computed(() => {
//   return allCategories.slice(position.value, position.value + NUM_CATEGORY)
// })
const key = ref(localStorage.getItem('key'))
const api = (q) => `https://pixabay.com/api/?key=${key.value}&q=${q}&image_type=photo&pretty=true`
let photoURLs = ref({})
let images = ref([])

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const updateCategories = async () => {
  for (const category of allCategories) {
    const resp = await fetch(api(category))
    const json = await resp.json()
    photoURLs.value[category] = json.hits
  }
}

const getRandomImage = () => {
  const category = sample(allCategories)
  const image = {...sample(photoURLs.value[category]), category}
  return [category, image]
}
const updateURLs = async () => {
  let newImages = []
  let newCategories = []

  for (let i = 0; i < NUM_CATEGORY; i+= 1) {
    const [category,image]=getRandomImage()
    newImages.push(image)
    newCategories.push(category)
  }
  images.value = newImages
  categories.value = newCategories
}
updateCategories().then(updateURLs)

const speak = (msg) => {
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = msg;
  window.speechSynthesis.speak(utterance);
}
const play = async (name) => {
  const a = document.getElementById(name)
  // await a.pause()
  // if (a.canPlayType('audio/m4a')) {
  //   a.setAttribute('src',`${name}.m4a`);
  // }

  // audioSource.value = `/${name}.m4a`

  console.log(a)
  try {
    await a.play()
  }
  catch (error) {
    console.log({type: 'play error', error})
  }
  // audio.play();
}
const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}
const correctResponses = ['awesome', 'great work', 'great', 'fantastic']
const wrongResponses = ['sorry', 'try again', 'next time']
const correctAudios = ['youawesome', 'NiZhenBang', 'TaiBangLe', 'HenBang']
const wrongAudios = ['ZaiLaiYiCi', 'XiaCiZaiLai']
let moving = undefined
const onDragStart = (event, index) => {
  // moving = event.target
  event.dataTransfer.setData('source', event.target)
  event.dataTransfer.setData('index', index)

  console.log('drag', event)
}

const onTouchStart = (event, index) => {
  speak(images.value[index].category)
  event.dataTransfer.setData('source', event.target)
  event.dataTransfer.setData('index', index)
}

const onMouseDown = (event, index) => {
  // event.dataTransfer.setData('index', index)
  speak(images.value[index].category)
}

const onDrop = async (event, category) => {
  const source = event.dataTransfer.getData('source')
  const index = event.dataTransfer.getData('index')
  console.log('drop', event, source)
  const image = images.value[index]
  if ((image && image.tags && image.tags.includes(category)) || image && image.category === category) {
    console.log({result: 'great work', image, category})
    // speak(sample(correctResponses))
    await play(sample(correctAudios))
  } else {

    console.log({result: 'try again', image, category})
    // speak(sample(wrongResponses))
    await play(sample(wrongAudios))
  }

  updateURLs()
}


const onDragOver = (event) => {
  // console.log('dropover', event)
}


const emptyKey = ref(!key.value)
const saveKey = () => {
  localStorage.setItem('key', key.value)
  emptyKey.value = false
  updateCategories()
}
document.body.addEventListener('touchmove', function(event) {
  event.preventDefault();
}, false);
</script>

<template>
      <div class="key" v-if="emptyKey">
        <label name="key">Register and paste <a href="https://pixabay.com/api/docs/">Pixabay</a>  Key: <input type="text" v-model="key"></label>
        <button @click="saveKey">Save Key</button>
      </div>
  <div class="main">
  <div class="main-lane">
    <div class="main-cell centered" v-for="(image, index) in images"
         @dragstart="onDragStart($event, index)"
         @touchstart="onTouchStart($event, index)"
         @mousedown="onMouseDown($event, index)"
         draggable="true">
      <img :src="image.largeImageURL">
    </div>
  </div>
  <div class="main-lane">
    <div class="main-cell centered category" v-for="category in categories" :key="category"
         @drop.prevent="onDrop($event, category)"
         @touchend.prevent="onDrop($event, category)"
         @dragover.prevent="onDragOver($event)">
      {{category}}
    </div>
  </div>
  </div>
  <audio v-for="(audio,index) of correctAudios" :key="`correct-${index}`" :src="`/${audio}.m4a`" type="audio/mp4" :id="audio"></audio>
  <audio v-for="(audio,index) of wrongAudios" :key="`wrong-${index}`" :src="`/${audio}.m4a`" type="audio/mp4" :id="audio"></audio>
</template>
