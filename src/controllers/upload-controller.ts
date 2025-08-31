import { uploadConsoleLog, uploadFile } from '@/lib/request'
import { makeAutoObservable, runInAction } from 'mobx'
import { nanoid } from 'nanoid'

type FileItem = {
  id: string
  file: File
  status: 'uploading' | 'success' | 'error'
  url: string
}
class UploadController {
  fileList: FileItem[] = []

  constructor() {
    makeAutoObservable(this)
  }

  async uploadFiles(files: File[]) {
    for (const file of files) {
      runInAction(() => {
        this.fileList.push({
          id: nanoid(),
          file,
          status: 'uploading',
          url: '',
        })
      })
      const url = await uploadFile(file)
      runInAction(() => {
        const item = this.fileList.find(item => item.file === file)
        if (!item) return
        item.status = url ? 'success' : 'error'
        item.url = url
      })
    }
    return this.getSuccessFileUrls()
  }

  async updateConsoleLog(appId: string, file: File) {
    runInAction(() => {
      this.fileList.push({
        id: nanoid(),
        file,
        status: 'uploading',
        url: '',
      })
    })
    const url = await uploadConsoleLog(appId, file)
    runInAction(() => {
      const item = this.fileList.find(item => item.file === file)
      if (!item) return
      item.status = url ? 'success' : 'error'
      item.url = url
    })
    return this.getSuccessFileUrls()
  }

  removeFileById(id: string) {
    this.fileList = this.fileList.filter(item => item.id !== id)
  }

  getSuccessFileUrls(reset = false) {
    const urls = this.fileList
      .filter(item => item.status === 'success')
      .map(item => item.url)
    if (reset) this.reset()

    return urls
  }

  reset() {
    this.fileList = []
  }
}

export default new UploadController()
