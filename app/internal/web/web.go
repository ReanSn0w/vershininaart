package web

import (
	"fmt"
	"net/http"
	"os"
)

func New(contentDir string) *Server {
	return &Server{contentDir: contentDir}
}

type Server struct {
	contentDir string
}

func (s *Server) Run(port int) error {
	srv := http.Server{
		Addr: fmt.Sprintf(":%d", port),
	}

	srv.Handler = s.handler()

	return srv.ListenAndServe()
}

func (s *Server) handler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := s.contentDir + r.URL.Path

		fi, err := os.Stat(path)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		if !fi.IsDir() {
			http.ServeFile(w, r, path)
		} else {
			http.ServeFile(w, r, path+"/index.html")
		}
	})
}
