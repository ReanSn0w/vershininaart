package build

import (
	"fmt"
	"image"
	"image/jpeg"
	"os"
	"path/filepath"
	"strings"
	"webtool/internal/utils"

	"github.com/disintegration/imaging"
)

func PrepareImages(pages []utils.Page, publicPath string) (err error) {
	for i, page := range pages {
		if page.Bio.Image.Src != "" {
			err = prepareSingleImage(&pages[i].Bio.Image, publicPath)
			if err != nil {
				return fmt.Errorf("prepare image %s err: %s", page.Bio.Image.Src, err)
			}
		}

		for wi := range page.Works {
			image := &pages[i].Works[wi].Image
			err = prepareSingleImage(image, publicPath)
			if err != nil {
				return fmt.Errorf("prepare image %s err: %s", page.Works[wi].Image.Src, err)
			}
		}
	}

	return
}

func prepareSingleImage(img *utils.Image, publicPath string) error {
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
	if err := saveWithQuality(largePath, srcImage, 95); err != nil {
		return fmt.Errorf("failed to save large image: %w", err)
	}

	// Сохраняем thumbnail
	thumbPath := fmt.Sprintf(publicPath+"/pic/%s_thumb.jpg", fileNameWithoutExt)
	if err := saveWithQuality(thumbPath, srcImage, 60); err != nil {
		return fmt.Errorf("failed to save thumbnail: %w", err)
	}

	img.MaxQ = fmt.Sprintf("/pic/%s.jpg", fileNameWithoutExt)
	img.LowQ = fmt.Sprintf("/pic/%s_thumb.jpg", fileNameWithoutExt)
	return nil
}

func saveWithQuality(path string, img image.Image, quality int) error {
	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer f.Close()

	return jpeg.Encode(f, img, &jpeg.Options{Quality: quality})
}
