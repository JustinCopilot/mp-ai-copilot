
export default defineAppConfig({
  pages: [
    "pages/list/index",
    "pages/chat/index",
    "pages/chat_extension/index",

    // @TODO: 行为观察抽离单独分包
    "education/pages/my_archive/index",
    "education/pages/jot_down_reference_detail/index",
    "education/pages/data_reference_detail/index",
    "education/pages/choose_child/index",
    "education/pages/jot_down_detail/index",
    "education/pages/archive_observation/index",
    "education/pages/information_supplement/index",
    "education/pages/observation_detail/index"
  ],
})
