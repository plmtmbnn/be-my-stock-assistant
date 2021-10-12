export function thousandSeparator (num: number) {
  try {
    let newNumber: string = num.toString();
    let postFix: string = '';
    let removeAfter: number = 0;
    if (newNumber.length > 12) {
      postFix = ' T';
      removeAfter = newNumber.length - 12;
    } else if (newNumber.length > 9) {
      postFix = ' miliar';
      removeAfter = newNumber.length - 9;
    } else if (newNumber.length > 6) {
      postFix = ' jt';
      removeAfter = newNumber.length - 6;
    } else {
    }
    if (removeAfter !== 0) {
      newNumber = '';
    }
    for (let index = 0; index < removeAfter; index++) {
      newNumber = newNumber + num.toString()[index];
    }
    return newNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + `${removeAfter === 0 ? '' : '.' + num.toString()[removeAfter] + num.toString()[removeAfter + 1]}` + postFix;
  } catch (e) {
    return 0;
  }
}

export function tickedNumber (number) {
  try {
    const parsedNumber: number = parseInt(number);
    let newNumber: number = 0;
    if (parsedNumber <= 200) {
      newNumber = Math.round(parsedNumber / 1) * 1;
    }
    if (parsedNumber > 200 && parsedNumber <= 500) {
      newNumber = Math.round(parsedNumber / 2) * 2;
    }
    if (parsedNumber > 500 && parsedNumber <= 2000) {
      newNumber = Math.round(parsedNumber / 5) * 5;
    }
    if (parsedNumber > 2000 && parsedNumber <= 5000) {
      newNumber = Math.round(parsedNumber / 10) * 10;
    }

    if (parsedNumber > 5000) {
      newNumber = Math.round(parsedNumber / 25) * 25;
    }

    return newNumber;
  } catch (e) {
    return 0;
  }
}
