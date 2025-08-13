import { Tag } from '@/components/tag'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import uploadController from '@/controllers/upload-controller'
import { Files } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

export const FileList = observer(() => {
  const { t } = useTranslation()

  if (!uploadController.fileList.length) return null

  return (
    <div className="pt-2">
      <Alert>
        <Files />
        <AlertTitle>{t('chat.uploadedFiles')}</AlertTitle>
        <AlertDescription>
          <div className="flex flex-wrap gap-2 mt-2">
            {uploadController.fileList.map((item, index) => (
              <Tag
                key={index}
                onClose={() => uploadController.removeFile(index)}
              >
                {item.file.name}
              </Tag>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
})
