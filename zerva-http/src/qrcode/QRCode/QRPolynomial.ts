import QRMath from './QRMath.js'

export default class QRPolynomial {
  num: number[]

  constructor(num: number[], shift: number) {
    if ((num as any).length === undefined)
      throw new Error(`${num.length}/${shift}`)

    let offset = 0
    while (offset < num.length && num[offset] === 0) offset++

    this.num = Array.from({ length: num.length - offset + shift }, () => 0)
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset]
    }
  }

  get(index: number) {
    return this.num[index]
  }

  getLength() {
    return this.num.length
  }

  multiply(e: QRPolynomial) {
    const num: number[] = Array.from({ length: this.getLength() + e.getLength() - 1 }, () => 0)
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)))
      }
    }
    return new QRPolynomial(num as any, 0)
  }

  mod(e: QRPolynomial): QRPolynomial {
    if (this.getLength() - e.getLength() < 0)
      return this
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0))
    const num: number[] = Array.from({ length: this.getLength() }, () => 0)
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i)
    for (let x = 0; x < e.getLength(); x++) {
      num[x] ^= QRMath.gexp(QRMath.glog(e.get(x)) + ratio)
    }
    return new QRPolynomial(num as any, 0).mod(e)
  }
}
