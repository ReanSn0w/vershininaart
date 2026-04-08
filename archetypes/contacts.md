+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
description = 'Contacts page'
type = 'contacts'
layout = 'contacts'

[[contacts]]
title = "Email"
value = "example@example.com"
link = "mailto:example@example.com"
custom = ""

[[contacts]]
title = "Phone"
value = "+1 (000) 000-00-00"
link = "tel:+1000000000"
custom = ""

[[contacts]]
title = "Instagram"
value = "@example"
link = "https://www.instagram.com/example"
custom = " target=\"_blank\" rel=\"noopener noreferrer\""
+++
