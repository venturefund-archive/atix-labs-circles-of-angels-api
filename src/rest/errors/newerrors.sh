#!/bin/bash
input="errors"
while IFS= read -r line
do
  echo $line
done < $input
