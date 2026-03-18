package build

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"webtool/internal/utils"

	"github.com/disintegration/imaging"
)

func PrepareImages(pages []utils.Page, publicPath string, maxWidthForLowQ int) (err error) {
	for i, page := range pages {
		if page.Bio.Image.Src != "" {
			err = prepareSingleImage(&pages[i].Bio.Image, publicPath, maxWidthForLowQ)
			if err != nil {
				return fmt.Errorf("prepare image %s err: %s", page.Bio.Image.Src, err)
			}
		}

		for wi := range page.Works {
			image := &pages[i].Works[wi].Image
			err = prepareSingleImage(image, publicPath, maxWidthForLowQ)
			if err != nil {
				return fmt.Errorf("prepare image %s err: %s", page.Works[wi].Image.Src, err)
			}
		}
	}

	return
}

func prepareSingleImage(img *utils.Image, publicPath string, maxWidthForLowQ int) error {
	// Получаем имя файла без расширения
	fileName := filepath.Base(img.Src)
	fileNameWithoutExt := strings.TrimSuffix(fileName, filepath.Ext(fileName))

	// Открываем исходное изображение
	srcImage, err := imaging.Open(img.Src)
	if err != nil {
		return fmt.Errorf("failed to open image: %w", err)
	}

	// Убедимся что директория существует
	if err := os.MkdirAll(publicPath+"/pic", os.ModePerm); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Сохраняем большое изображение в JPEG
	largePath := fmt.Sprintf(publicPath+"/pic/%s.jpg", fileNameWithoutExt)
	if err := imaging.Save(srcImage, largePath); err != nil {
		return fmt.Errorf("failed to save large image: %w", err)
	}

	// Создаём thumbnail с изменением размера по ширине
	// высота пересчитывается автоматически (0 = auto)
	thumbnail := imaging.Resize(srcImage, maxWidthForLowQ, 0, imaging.Lanczos)

	// Сохраняем thumbnail
	thumbPath := fmt.Sprintf(publicPath+"/pic/%s_thumb.jpg", fileNameWithoutExt)
	if err := imaging.Save(thumbnail, thumbPath); err != nil {
		return fmt.Errorf("failed to save thumbnail: %w", err)
	}

	img.MaxQ = fmt.Sprintf("/pic/%s.jpg", fileNameWithoutExt)
	img.LowQ = fmt.Sprintf("/pic/%s_thumb.jpg", fileNameWithoutExt)
	return nil
}
