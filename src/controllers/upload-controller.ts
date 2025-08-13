import { makeAutoObservable, runInAction } from 'mobx'

class UploadController {
  fileList: {
    file: File
    url: string
  }[] = []

  constructor() {
    makeAutoObservable(this)
  }

  async uploadFiles(files: File[]) {
    // for (const file of files) {
    //   const url = await uploadFile(file)
    //   if (url)
    //     runInAction(() => {
    //       this.fileList.push({
    //         file,
    //         url,
    //       })
    //     })
    // }
    runInAction(() => {
      this.fileList = files.map(file => ({
        file,
        url: '',
      }))
    })
  }

  removeFile(index: number) {
    this.fileList.splice(index, 1)
  }

  reset() {
    this.fileList = []
  }
}

export default new UploadController()
