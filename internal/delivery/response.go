package delivery

import "net/http"

type Context interface {
	JSON(code int, obj any)
	SecureJSON(code int, obj any)
}

type ErrorInfo struct {
	Code    string `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
}

type Meta struct {
	Page     int  `json:"page,omitempty"`
	PerPage  int  `json:"per_page,omitempty"`
	Total    int  `json:"total,omitempty"`
	LastPage int  `json:"last_page,omitempty"`
	Next     *int `json:"next,omitempty"`
	Prev     *int `json:"prev,omitempty"`
}

type Response struct {
	Success bool       `json:"success"`
	Data    any        `json:"data,omitempty"`
	Error   *ErrorInfo `json:"errors,omitempty"`
	Meta    *Meta      `json:"meta,omitempty"`
}

type Responser struct {
	ctx        Context
	statusCode int
	secure     bool
	response   Response
}

func NewResponser(ctx Context) *Responser {
	return &Responser{
		ctx:        ctx,
		statusCode: http.StatusOK,
		response: Response{
			Success: true,
		},
	}
}

func (r *Responser) Status(code int) *Responser {
	r.statusCode = code
	return r
}

func (r *Responser) WithData(data any) *Responser {
	r.response.Data = data
	return r
}

func (r *Responser) WithMeta(meta *Meta) *Responser {
	r.response.Meta = meta
	return r
}

func (r *Responser) WithError(code string, message string) *Responser {
	r.response.Success = false
	r.response.Error = &ErrorInfo{
		Code:    code,
		Message: message,
	}
	return r
}

func (r *Responser) SecureJSON() *Responser {
	r.secure = true
	return r
}

func (r *Responser) Send() {
	if r.secure {
		r.ctx.SecureJSON(r.statusCode, r.response)
		return
	}
	r.ctx.JSON(r.statusCode, r.response)
}
