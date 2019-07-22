/**
 * Utils for pointers passed into cpp function
 * By TheoXiong 2019/07/18
 */

/**
 * @function creat a one-dimensional pointer, point to Emscripten heap, with specific length, lick char*, unsigned char*, char[5] in C
 * @param {Object} Module Emscripten exported module
 * @param {Number} length the length of allocated Emscripten heap
 * @return {Object} pointer: point to allocated Emscripten heap; free: the function for free memory
 */
const bytePointer = (Module, length) => {
  assertCondition(length > 0, 'Invalid param of length.')
  let pointerObject = {}
  // One more than the specified length, used for the end of string, such as '\0'
  pointerObject.pointer = Module._malloc(length + 1)

  pointerObject.free = () => {
    if (pointerObject.pointer) {
      Module._free(pointerObject.pointer)
      pointerObject.pointer = 0
      pointerObject.free = null
    }
  }

  return pointerObject
}

/**
 * @function creat a one-dimensional pointer, point to Emscripten heap, with specified number type, lick int*, float*, short* in C
 * @param {Object} Module Emscripten exported module
 * @param {String} type specify the type of number, optional value: 'int8'/'uint8'/'int16'/'uint16'/'int32'/'uint32'/'float32'/'float64'
 */
const numberPointer = (Module, type) => {
  let pointerObject = {}
  let length = getLengthByType(type)
  assertCondition(length > 0, 'Invalid param of type.')
  pointerObject.pointer = Module._malloc(length)

  pointerObject.free = () => {
    if (pointerObject.pointer) {
      Module._free(pointerObject.pointer)
      pointerObject.pointer = 0
      pointerObject.free = null
    }
  }

  return pointerObject
}

/**
 * @function creat a one-dimensional pointer, point to Emscripten heap, filled with given array, like int arr[3] = {1,2,3}, int *p = arr
 * @param {Object} Module Emscripten exported module
 * @param {TypedArray} typedArray the data pointed by the pointer, such as Int8Array/Uint8Array/Int32Array/Float32Array. pointer --> typedArray[0]
 * @return {Object} heap: the array directly accessed from allocated Emscripten heap; pointer: point to allocated Emscripten heap; free: the function for free memory
 */
const arrayPointer = (Module, typedArray) => {
  let pointerObject = {}
  pointerObject.heap = arrayToHeap(Module, typedArray)
  pointerObject.pointer = pointerObject.heap.byteOffset

  pointerObject.free = () => {
    if (pointerObject.heap) {
      Module._free(pointerObject.heap.byteOffset)
      pointerObject.heap = null
      pointerObject.pointer = 0
      pointerObject.free = null
    }
  }

  return pointerObject
}

/**
 * @function creat a one-dimensional pointer, point to Emscripten heap, filled with given string, lick char *p = "hello" in C
 * @param {Object} Module Emscripten exported module
 * @param {String} str the string used to fill the buffer pointed by the pointer. pointer --> str[0]
 * @return {Object} pointer: point to allocated Emscripten heap; free: the function for free memory
 */
const stringPointer = (Module, str) => {
  let pointerObject = {}
  const strLen = Module.lengthBytesUTF8(str)
  pointerObject.pointer = Module._malloc(strLen + 1)
  Module.stringToUTF8(str, pointerObject.pointer, strLen + 1)

  pointerObject.free = () => {
    if (pointerObject.pointer) {
      Module._free(pointerObject.pointer)
      pointerObject.pointer = 0
      pointerObject.free = null
    }
  }

  return pointerObject
}

/**
 * @function creat a two-dimensional pointer, point to Emscripten heap, like unsigned char**
 * @param {Object} Module Emscripten exported module
 * @param {Number} row length of the first dimensional
 * @param {Number} column length of the second dimensional, such as array[row][column]
 * @param {Boolean} filledByZero optional, whether to fill with zero
 * @return {Object} the pointer and heap array; should call 'free' method to free memory after used
 */
const pointerPointer = (Module, row, column, filledByZero = true) => {
  let pPointerObject = {}

  let nDataBytes = row * column
  let ptr = Module._malloc(nDataBytes)
  pPointerObject.dataHeap = new Uint8Array(Module.HEAPU8.buffer, ptr, nDataBytes)
  filledByZero ? pPointerObject.dataHeap.set(new Uint8Array(new ArrayBuffer(nDataBytes))) : ''

  let pointers = new Uint32Array(row)
  for (var i = 0; i < pointers.length; i++) {
    pointers[i] = ptr + i * column
  }
  let nPointerBytes = pointers.length * pointers.BYTES_PER_ELEMENT
  let pointerPtr = Module._malloc(nPointerBytes)
  pPointerObject.pointerHeap = new Uint8Array(Module.HEAPU8.buffer, pointerPtr, nPointerBytes)
  pPointerObject.pointerHeap.set(new Uint8Array(pointers.buffer))
  pPointerObject.pointer = pPointerObject.pointerHeap.byteOffset

  pPointerObject.free = () => {
    Module._free(pPointerObject.pointerHeap.byteOffset)
    Module._free(pPointerObject.dataHeap.byteOffset)
    pPointerObject.pointerHeap = null
    pPointerObject.dataHeap = null
    pPointerObject.pointer = 0
    pPointerObject.free = null
  }

  return pPointerObject
}

/**
 * @function get data by the two-dimensional pointer, return a array include string, such as array["abc", "123"]
 * @param {Object} Module Emscripten exported module
 * @param {Number} pPointer the two-dimensional pointer, such as char **p
 * @param {Number} row length of the first dimensional
 * @param {Number} column length of the second dimensional, such as array[row][column]
 * @return {Array} the data taken out of Emscripten heap
 */
const pointerPointerToStringArray = (Module, pPointer, row, column) => {
  let result = []

  let pointerArr = new Int32Array(Module.HEAPU8.buffer, pPointer, row)
  for (let i = 0; i < row; i++) {
    result.push(pointerToString(Module, pointerArr[i], column))
  }

  return result
}

/**
 * @function get data by the two-dimensional pointer, return a array include bytes array, such as array[[1,2],[3,4]]
 * @param {Object} Module Emscripten exported module
 * @param {Number} pPointer the two-dimensional pointer, such as unsigned char **p
 * @param {Number} row length of the first dimensional
 * @param {Number} column length of the second dimensional, such as array[row][column]
 * @return {Array} the data taken out of Emscripten heap
 */
const pointerPointerToByteArray = (Module, pPointer, row, column) => {
  let result = []

  let pointerArr = new Int32Array(Module.HEAPU8.buffer, pPointer, row)
  for (let i = 0; i < row; i++) {
    result.push(pointerToArray(Module, pointerArr[i], column, 'uint8'))
  }

  return result
}

/**
 * @function get data by the one-dimensional pointer, return a array include bytes array
 * @param {Object} Module Emscripten exported module
 * @param {Number} pointer the one-dimensional pointer, such as unsigned char *p
 * @param {Number} length length of the memory pointed by the pointer
 * @param {String} type specify the data type, optional value: 'int8'/'uint8'/'int16'/'uint16'/'int32'/'uint32'/'float32'/'float64'
 * @param {Boolean} convert whether to convert typedArray to normal array, default: true
 */
const pointerToArray = (Module, pointer, length, type, convert = true) => {
  let typedArray = null
  switch (type) {
    case 'int8':
      typedArray = new Int8Array(Module.HEAPU8.buffer, pointer, length)
      break
    case 'uint8':
      typedArray = new Uint8Array(Module.HEAPU8.buffer, pointer, length)
      break
    case 'int16':
      typedArray = new Int16Array(Module.HEAPU8.buffer, pointer, length)
      break
    case 'uint16':
      typedArray = new Uint16Array(Module.HEAPU8.buffer, pointer, length)
      break
    case 'int32':
      typedArray = new Int32Array(Module.HEAPU8.buffer, pointer, length)
      break
    case 'uint32':
      typedArray = new Uint32Array(Module.HEAPU8.buffer, pointer, length)
      break
    case 'float32':
      typedArray = new Float32Array(Module.HEAPU8.buffer, pointer, length)
      break
    case 'float64':
      typedArray = new Float64Array(Module.HEAPU8.buffer, pointer, length)
      break
    default:
      break
  }
  if (typedArray) {
    let result = convert ? typedArrayToArray(typedArray) : typedArray
    return result
  } else {
    return null
  }
}

/**
 * @function get data by the one-dimensional pointer, return a string
 * @param {Object} Module Emscripten exported module
 * @param {Number} pointer the one-dimensional pointer, such as unsigned char *p
 * @param {Number} length [optional] an optional length that specifies the maximum number of bytes to read
 */
const pointerToString = (Module, pointer, length) => {
  if (typeof length === 'number' && length > 0) {
    return Module.UTF8ToString(pointer, length)
  } else {
    return Module.UTF8ToString(pointer)
  }
}

/**
 * @function allocate memory on Emscripten heap, and copy data to it from array
 * @param {Object} Module Emscripten exported module
 * @param {*} array data array
 * @return {TypedArray} the array directly accessed from allocated Emscripten heap
 */
const arrayToHeap = (Module, typedArray) => {
  let nDataBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT
  let ptr = Module._malloc(nDataBytes)
  let dataHeap = new Uint8Array(Module.HEAPU8.buffer, ptr, nDataBytes)
  dataHeap.set(new Uint8Array(typedArray.buffer))
  return dataHeap
}

const assertCondition = (condition, message) => {
  if (!condition) {
    const assertionError = (message && typeof message === 'string') ? message : 'Assertion Error'
    throw new Error(assertionError)
  }
}

const typedArrayToArray = (typedArray) => {
  return Array.from(typedArray)
}

const getLengthByType = (type) => {
  let length = 0
  switch (type) {
    case 'int8':
      length = Int8Array.BYTES_PER_ELEMENT
      break
    case 'uint8':
      length = Uint8Array.BYTES_PER_ELEMENT
      break
    case 'int16':
      length = Int16Array.BYTES_PER_ELEMENT
      break
    case 'uint16':
      length = Uint16Array.BYTES_PER_ELEMENT
      break
    case 'int32':
      length = Int32Array.BYTES_PER_ELEMENT
      break
    case 'uint32':
      length = Uint32Array.BYTES_PER_ELEMENT
      break
    case 'float32':
      length = Float32Array.BYTES_PER_ELEMENT
      break
    case 'float64':
      length = Float64Array.BYTES_PER_ELEMENT
      break
    default:
      break
  }
  return length
}

if (typeof module === 'object' && typeof exports === 'object' && module) {
  module.exports = {
    bytePointer,
    numberPointer,
    arrayPointer,
    stringPointer,
    pointerPointer,
    pointerToArray,
    pointerToString,
    pointerPointerToStringArray,
    pointerPointerToByteArray
  }
}
