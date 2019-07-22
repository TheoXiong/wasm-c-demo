#include <stdio.h>
#include <emscripten.h>

int EMSCRIPTEN_KEEPALIVE square (int a)
{
  return a * a;
}

int * EMSCRIPTEN_KEEPALIVE squareArray (int *arr, int length)
{
  for (int i = 0; i < length; i++) {
    arr[i] = arr[i] * arr[i];
  }
  return arr;
}

void EMSCRIPTEN_KEEPALIVE getChars (char *str, int length)
{
  for (int i = 0; i < length; i++) {
    *(str + i) = 70 + i;
  }
}

char * EMSCRIPTEN_KEEPALIVE reverse (char *str, int length)
{
  char tmp = '\0';
  for (int i = 0; i < length / 2; i++) {
    tmp = *(str + i);
    *(str + i) = *(str + length - 1 - i);
    *(str + length - 1 - i) = tmp;
  }
  return str;
}

void EMSCRIPTEN_KEEPALIVE getCharsInArray (char **p, int row, int column)
{
  for (int i = 0; i < row; i++) {
    for (int j = 0; j < column - 1; j++) {
      *(*(p + i) + j) = i * column + j + 65;
    }
  }
}

void EMSCRIPTEN_KEEPALIVE getNumbersInArray (unsigned char **p, int row, int column)
{
  for (int i = 0; i < row; i++) {
    for (int j = 0; j < column; j++) {
      *(*(p + i) + j) = i * column + j + 1;
    }
  }
}

typedef struct
{
  int a;
  char b;
  short c;
} Simple;

void EMSCRIPTEN_KEEPALIVE testStruct (Simple *input, Simple *output, int a, char b, short c)
{
  output->a = input->a + a;
  output->b = b;
  output->c = input->c - c;
}
