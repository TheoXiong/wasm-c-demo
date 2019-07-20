const Module = require('../build/demo.js')
const {
  arrayPointer,
  bytePointer,
  stringPointer,
  pointerPointer,
  pointerToArray,
  pointerToString,
  pointerPointerToStringArray,
  pointerPointerToByteArray
} = require('../lib/pointer.js')

console.log('Running...')
Module.onRuntimeInitialized = () => {
  square()
  squareArray()
  getChars()
  reverseString()
  getCharsInArray()
  getNumbersInArray()
  testStruct()
}

const square = () => {
  console.log('[ Call c funtion ][ square ]: ', Module._square(8))
}

const squareArray = () => {
  let array = new Int32Array([1, 2, 3, 4, 5])

  let ptrObj = arrayPointer(Module, array)
  Module._squareArray(ptrObj.pointer, array.length)
  let result = pointerToArray(Module, ptrObj.pointer, array.length, 'int32')
  ptrObj.free()
  console.log('[ Call c funtion ][ squareArray ]:', result)
}

const getChars = () => {
  let len = 10
  let ptrObj = bytePointer(Module, len)
  Module._getChars(ptrObj.pointer, len)
  let result = pointerToString(Module, ptrObj.pointer, len)
  ptrObj.free()
  console.log('[ Call c funtion ][ getChars ]:', result)
}

const reverseString = () => {
  let str = 'hello'

  let ptrObj = stringPointer(Module, str)
  Module._reverse(ptrObj.pointer, str.length)
  let reversedStr = pointerToString(Module, ptrObj.pointer, str.length)
  ptrObj.free()
  console.log('[ Call c funtion ][ reverse ]:', reversedStr)
}

const getCharsInArray = () => {
  let row = 4
  let column = 6

  let result = []
  let ptrObj = pointerPointer(Module, row, column)
  Module._getCharsInArray(ptrObj.pointer, row, column)
  result = pointerPointerToStringArray(Module, ptrObj.pointer, row, column)
  ptrObj.free()
  console.log('[ Call c funtion ][ getCharsInArray ]:', result)
}

const getNumbersInArray = () => {
  let row = 5
  let column = 8

  let result = []
  let ptrObj = pointerPointer(Module, row, column)
  Module._getNumbersInArray(ptrObj.pointer, row, column)
  result = pointerPointerToByteArray(Module, ptrObj.pointer, row, column)
  ptrObj.free()
  console.log('[ Call c funtion ][ getNumbersInArray ]:', result)
}

const testStruct = () => {
  // let len = 8
  // let ptrObj = bytePointer(Module, len)

  // Module.setValue(ptrObj.pointer, 666, 'i32')
  // Module.setValue(ptrObj.pointer + 4, 67, 'i8')
  // Module.setValue(ptrObj.pointer + 6, 123, 'i16')

  // console.log('1111....', ptrObj.pointer, new Uint8Array(Module.HEAPU8.buffer, ptrObj.pointer, len))
  // let result = Module._testStruct(ptrObj.pointer, 2, 'C', 500)
}
