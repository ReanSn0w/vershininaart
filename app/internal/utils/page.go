package utils

import (
	"html/template"

	"github.com/russross/blackfriday/v2"
)

type Image struct {
	// Ссылка на ресурс в каталоге или asset возле страницы
	Src string `yaml:"src"`

	// Альтернативный текст для изображения
	Alt string `yaml:"alt"`

	LowQ string `yaml:"-"`
	MaxQ string `yaml:"-"`
}

type Page struct {
	FileLocation string `yaml:"-"`

	// Название шаблона для страницы
	TMPL string `yaml:"tmpl"`

	// Заголовок страницы
	Title string `yaml:"title"`

	// Коллекция
	Collection string `yaml:"collection"`

	// Информация для главной страницы сайта
	Index []struct {
		Tag   string `yaml:"tag"`
		Title string `yaml:"title"`
		Sub   []Page `yaml:"-"`
	} `yaml:"index"`

	// Информация для страницы биографии
	Bio struct {
		Image Image  `yaml:"image"`
		Text  string `yaml:"text"`
	} `yaml:"bio"`

	// Информация для страницы контактов
	Contacts []struct {
		Title  string `yaml:"title"`
		Value  string `yaml:"value"`
		Link   string `yaml:"link"`
		Custom string `yaml:"custom"`
	} `yaml:"contacts"`

	// Информация для страницы резюме
	CV []struct {
		Title string `yaml:"title"`
		Items []struct {
			Title       string `yaml:"title"`
			Year        string `yaml:"year"`
			Description string `yaml:"description"`
		} `yaml:"items"`
	} `yaml:"cv"`

	// Информация для страницы работ
	Works []struct {
		Image     Image  `yaml:"image"`
		Title     string `yaml:"title"`
		Year      string `yaml:"year"`
		Technique string `yaml:"technique"`
		Size      string `yaml:"size"`
		Sheet     string `yaml:"sheet"`
	} `yaml:"works"`
}

func (p Page) BioMarkdown() template.HTML {
	html := blackfriday.Run([]byte(p.Bio.Text))
	return template.HTML(html)
}
