from rest_framework import serializers


class BaseSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        fields = kwargs.pop("fields", None)
        exclude = kwargs.pop("exclude", None)

        super().__init__(*args, **kwargs)

        if fields:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

        if exclude:
            for field_name in exclude:
                self.fields.pop(field_name)

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #
    #     filtered_data = {
    #         key: value for key, value in data.items() if value is not None
    #     }
    #
    #     return filtered_data
